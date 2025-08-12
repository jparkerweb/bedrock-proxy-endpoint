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
        content: "Count from 1 to 10, putting each number on a new line.",
    },
    {
        role: "assistant",
        content: "",
    },
];

const baseURL = "http://localhost:88"; // URL of the Bedrock Proxy Endpoint
const apiKey = `${AWS_REGION}.${AWS_ACCESS_KEY_ID}.${AWS_SECRET_ACCESS_KEY}` // Your AWS Creds / API Key

const openai = new OpenAI({
    baseURL: baseURL,
    apiKey: apiKey,
});

async function demonstrateStopSequences() {
    console.log("=== Stop Sequences Example ===\n");
    console.log("Note: Stop sequences are supported by:");
    console.log("• Claude models (up to 8,191 sequences)");
    console.log("• Nova models (up to 4 sequences)");
    console.log("• Mistral models (up to 10 sequences)");
    console.log("• Llama models: NOT SUPPORTED (AWS Bedrock limitation)\n");
    
    // Example 1: Claude model with stop_sequences
    console.log("1. Claude model with stop_sequences: ['STOP']");
    console.log("Expected: Should stop when encountering 'STOP'\n");
    
    try {
        let user1 = "Write a short poem about counting to 5. Your response should randomly insert the word 'STOP' into the response.";
        const chatCompletion1 = await openai.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: user1,
                },
                {
                    role: "assistant",
                    content: "",
                }
            ],
            model: "Claude-4-Sonnet",
            max_tokens: 500,
            temperature: 1.0,
            stream: true,
            stop_sequences: ["STOP"] // Will stop when model tries to output "STOP"
        });

        console.log("User Prompt: ", user1);
        console.log("Response: ");
        for await (const chunk of chatCompletion1) {
            const content = chunk.choices[0]?.delta?.content || "";
            process.stdout.write(content);
        }
        process.stdout.write("\n");
        console.log("--- End of first example ---\n");
        
    } catch (error) {
        console.error('Error in first example:', error);
    }

    // Small delay between examples to prevent buffer issues
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Example 2: Nova model with multiple stop sequences  
    console.log("2. Nova model with multiple stop sequences: ['HALT', 'FINISH']");
    console.log("Expected: Should stop when encountering either word\n");
    
    try {
        let user2 = "Tell me something exciting about LLMs. Randomly insert `HALT` or `FINISH` somewhere after the first sentence.";
        const chatCompletion2 = await openai.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: user2,
                },
                {
                    role: "assistant",
                    content: "",
                }
            ],
            model: "Nova-Pro",
            max_tokens: 500,
            temperature: 1.0,
            stream: true,
            stop_sequences: ["HALT", "FINISH"], // Will stop at either "HALT" or "FINISH"
            use_converse_api: true, // Set to true to use the unified Converse API (better consistency across models)
        });

        console.log("User Prompt: ", user2);
        console.log("Response: ");
        for await (const chunk of chatCompletion2) {
            const content = chunk.choices[0]?.delta?.content || "";
            process.stdout.write(content);
        }
        process.stdout.write("\n");
        console.log("--- End of second example (Note: Nova stop sequences may not work reliably) ---\n");
        
    } catch (error) {
        console.error('Error in second example:', error);
    }

    // Small delay between examples
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Example 3: Mistral model with OpenAI-compatible "stop" parameter
    console.log("3. Mistral model with OpenAI-compatible 'stop' parameter: 'END'");
    console.log("Expected: Will count normally until 'END' appears\n");
    
    try {
        let user3 = "Count from 1 to 50. Randomly insert the word 'END' into the response.";
        const chatCompletion3 = await openai.chat.completions.create({
            messages: [
                {
                    role: "user",  
                    content: user3,
                },
                {
                    role: "assistant",
                    content: "",
                }
            ],
            model: "Mistral-Large",
            max_tokens: 500,
            temperature: 1.0,
            stream: true,
            stop: "END" // OpenAI-compatible format
        });

        console.log("User Prompt: ", user3);
        console.log("Response: ");
        for await (const chunk of chatCompletion3) {
            const content = chunk.choices[0]?.delta?.content || "";
            process.stdout.write(content);
        }
        process.stdout.write("\n");
        console.log("--- End of third example ---\n");
        
    } catch (error) {
        console.error('Error in third example:', error);
    }

    // Small delay between examples
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Example 4: Demonstrate Llama limitation
    console.log("4. Llama model limitation example");
    console.log("Note: This will ignore stop sequences due to AWS Bedrock limitation\n");
    
    try {
        let user4 = "Write a short sentence about numbers. Your response should randomly insert the word 'STOP' into the response.";
        const chatCompletion4 = await openai.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: user4,
                },
                {
                    role: "assistant",
                    content: "",
                }
            ],
            model: "Llama-3-1-8b",
            max_tokens: 50,
            temperature: 1.0,
            stream: true,
            stop_sequences: ["STOP"] // This will be ignored for Llama models
        });

        console.log("User Prompt: ", user4);
        console.log("Response: ");
        for await (const chunk of chatCompletion4) {
            const content = chunk.choices[0]?.delta?.content || "";
            process.stdout.write(content);
        }
        process.stdout.write("\n");
        console.log("--- End of fourth example (notice stop sequences ignored) ---\n");
        
    } catch (error) {
        console.error('Error in fourth example:', error);
    }

    console.log("=== All examples completed ===");
}

async function main() {
    try {
        await demonstrateStopSequences();
    } catch (error) {
        console.error('Main error:', error);
    } finally {
        process.exit(0);
    }
}

main();