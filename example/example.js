import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;

const messages = [
    {
        role: "system",
        content: "You are a helpful AI assistant that follows instructions extremely well. Answer the user questions accurately.",
    },
    {
        role: "user",
        content: "Describe why the OpenAI API standard is so great. Limit your response to five sentences.",
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
            model: "Claude-3-7-Sonnet-Thinking", // Try: "Claude-4-Sonnet", "Claude-4-Opus", "Claude-4-Sonnet-Thinking", "Claude-4-Opus-Thinking"
            max_tokens: 2048,
            temperature: 0.4,
            top_p: 0.7,
            stream: true,
            include_thinking_data: true, // Works with thinking models
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