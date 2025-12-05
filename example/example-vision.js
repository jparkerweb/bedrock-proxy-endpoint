import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;

const __dirname = path.resolve();
const base64Image = fs.readFileSync(path.join(__dirname, 'lizard.jpg')).toString('base64');
const messages = [
    {
        role: "system",
        content: "You are a helpful AI assistant that follows instructions extremely well. Answer the user questions accurately.",
    },
    {
        role: "user",
        content: [
            {
                type: "text",
                text: "What's in this image? Please describe it in detail."
            },
            {
                type: "image_url",
                image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                    // url: "https://github.com/jparkerweb/ref/blob/main/equill-labs/bedrock-proxy-endpoint/bedrock-proxy-endpoint.png?raw=true"
                }
            }
        ]
    },
];

const baseURL = "http://127.0.0.1:88"; // URL of the Bedrock Proxy Endpoint
const apiKey = `${AWS_REGION}.${AWS_ACCESS_KEY_ID}.${AWS_SECRET_ACCESS_KEY}` // Your AWS Creds / API Key

const openai = new OpenAI({
    baseURL: baseURL,
    apiKey: apiKey,
});

async function main() {
    try {
        const chatCompletion = await openai.chat.completions.create({
            messages: messages,
            model: "Claude-4-5-Opus-Thinking",
            max_tokens: 2048,
            temperature: 0.4,
            top_p: 0.7,
            stream: true,
            use_converse_api: true, // Set to true to use the unified Converse API (better consistency across models)
        });

        if (chatCompletion) {
            for await (const chunk of chatCompletion) {
                const response = chunk.choices[0]?.delta?.content || "";
                process.stdout.write(response);
            }
            // Add a newline at the end for cleaner output
            process.stdout.write('\n');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Explicitly exit the process when done
        process.exit(0);
    }
}

main();