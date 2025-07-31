// -------------------------------------------------
// -- import environment variables from .env file --
// -------------------------------------------------
import dotenv from 'dotenv';
dotenv.config();

// ------------------------------
// -- import utility functions --
// ------------------------------
import { toBoolean, extractAWSCreds } from "./utils.js";

const CONSOLE_LOGGING = toBoolean(process.env.CONSOLE_LOGGING);
const HTTP_ENABLED = toBoolean(process.env.HTTP_ENABLED);
const HTTP_PORT = process.env.HTTP_PORT;
const HTTPS_ENABLED = toBoolean(process.env.HTTPS_ENABLED);
const HTTPS_PORT = process.env.HTTPS_PORT;
const HTTPS_KEY_PATH = process.env.HTTPS_KEY_PATH;
const HTTPS_CERT_PATH = process.env.HTTPS_CERT_PATH;
const IP_RATE_LIMIT_ENABLED = toBoolean(process.env.IP_RATE_LIMIT_ENABLED);
const IP_RATE_LIMIT_WINDOW_MS = parseInt(process.env.IP_RATE_LIMIT_WINDOW_MS);
const IP_RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.IP_RATE_LIMIT_MAX_REQUESTS);
const MAX_REQUEST_BODY_SIZE = process.env.MAX_REQUEST_BODY_SIZE || '1mb';

// --------------------------------------------
// -- import functions from bedrock-wrapper  --
// --     - bedrockWrapper                    --
// --     - listBedrockWrapperSupportedModels --
// --------------------------------------------
import { 
    bedrockWrapper,
    listBedrockWrapperSupportedModels
} from "bedrock-wrapper";

console.log("    ============================ PROXY ENDPOINT =============================");
console.log("");

// -----------------------------------
// -- import server and its modules --
// -----------------------------------
import express from 'express';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { stdout } from 'process';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(bodyParser.json({ limit: MAX_REQUEST_BODY_SIZE }));

// ------------------------------------
// -- setup rate limiting middleware --
// ------------------------------------
if (IP_RATE_LIMIT_ENABLED) {
    const limiter = rateLimit({
        windowMs: IP_RATE_LIMIT_WINDOW_MS,
        max: IP_RATE_LIMIT_MAX_REQUESTS
    });
    app.use(limiter);
}

// -------------------------------
// -- error handling middleware --
// -------------------------------
app.use((err, req, res, next) => {
    if (err.code === 'ECONNRESET') {
        console.warn('Connection reset by peer');
        res.status(500).send('Connection reset by peer');
    } else if (err.headersSent) {
        return next(err);
    } else {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    }
});


// -------------------
// -- Info endpoint --
// -------------------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// -------------------------------------
// -- Endpoint: list supported models --
// -------------------------------------
app.get('/models', (req, res) => {
    listBedrockWrapperSupportedModels().then(supportedModels => {
        res.json(supportedModels);
    }).catch(err => {
        res.status(500).send('Failed to fetch models');
    });
});

app.post('/test/chat/completions', async (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    const data = {choices: [{delta: {
        content: "(ツ) → Test message from Bedrock Proxy Endpoint"
    }}]};
    res.write(`data: ${JSON.stringify(data)}\n\n`);

    res.end();
});

// --------------------------------------------------------
// -- Endpoint: infer AWS Bedrock Proxy Chat Completions --
// --------------------------------------------------------
app.post('/chat/completions', async (req, res) => {
    if (CONSOLE_LOGGING) { console.log("\n\n--new '/chat/completions' request --------------------------------"); }

    // Extract parameters from the incoming request
    const {
        messages = [],
        model = 'Llama-3-8b',
        max_tokens = 800,
        temperature = 0.1,
        top_p = 0.9,
        stream = true,
        include_thinking_data = false
    } = req.body;

    // validate messages array exists
    if (!messages.length) {
        res.status(400).send('Messages array is empty');
        return;
    }

    // extract AWS credentials from the request
    const bearerToken = req.rawHeaders.find(item => item.startsWith("Bearer "));
    const token = bearerToken ? bearerToken.substring(7) : null;
    const tokenParts = extractAWSCreds(token);
    if (tokenParts.error) {
        res.status(401).send(tokenParts.message);
        return;
    } else {
        var { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = tokenParts.credentials;
    }
    
    // validate AWS credentials
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
        res.status(401).send('Unauthorized');
        return;
    }

    // ---------------------------------------------------
    // -- create an object to hold your AWS credentials --
    // ---------------------------------------------------
    const awsCreds = {
        region: AWS_REGION,
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    };
    // ----------------------------------------------------------------------
    // -- create an object that copies your openai chat completions object --
    // ----------------------------------------------------------------------
    const openaiChatCompletionsCreateObject = {
        messages: messages,
        model: model,
        max_tokens: max_tokens,
        stream: stream,
        temperature: temperature,
        top_p: top_p,
        include_thinking_data: include_thinking_data,
        ...(req.body.stop && { stop: req.body.stop }),
        ...(req.body.stop_sequences && { stop_sequences: req.body.stop_sequences })
    };

    // set the response headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    // create a variable to hold the complete response
    let completeResponse = '';

    try {
        // check if the call is streamed
        if (openaiChatCompletionsCreateObject.stream) {
            // -------------------
            // -- streamed call --
            // -------------------
            for await (const chunk of bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { logging: CONSOLE_LOGGING })) {
                // collect the response chunks
                completeResponse += chunk;
                // create a data object and send to the client
                const data = {choices: [{delta: {
                    content: chunk
                }}]};
                res.write(`data: ${JSON.stringify(data)}\n\n`);
                // log the response to the console
                if (CONSOLE_LOGGING) { stdout.write(chunk); }
            }
            res.end();
        } else {
            // ---------------------
            // -- unstreamed call --
            // ---------------------
            const response = await bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { logging: CONSOLE_LOGGING });
            for await (const data of response) {
                // collect the response
                completeResponse += data;
            }
            // create a data object and send to the client
            const data = {choices: [{message: {
                content: completeResponse
            }}]};
            res.write(JSON.stringify(data));
            res.end();
        }
    } catch (error) {
        if (error.name === 'ThrottlingException') {
            console.error("Error during streaming:", error);
            if (!res.headersSent) {
                res.status(429).send("Too many requests, please wait before trying again.");
            }
        } else {
            console.error("Error during request processing:", error);
            if (!res.headersSent) {
                res.status(500).send("Server error during request processing.");
            }
        }
    }
});


// ----------------------
// -- start the server --
// ----------------------
if (HTTP_ENABLED) {
    // start the HTTP server
    const httpServer = http.createServer(app);
    httpServer.listen(HTTP_PORT, () => {
        console.log(`HTTP Server listening on port ${HTTP_PORT}`);
    });
}
if (HTTPS_ENABLED) {
    // start the HTTPS server
    const httpsServer = https.createServer({
        key: fs.readFileSync(HTTPS_KEY_PATH, 'utf-8'),
        cert: fs.readFileSync(HTTPS_CERT_PATH, 'utf-8')
    }, app);
    httpsServer.listen(HTTPS_PORT, () => {
        console.log(`HTTPS Server listening on port ${HTTPS_PORT}`);
    });
}  
