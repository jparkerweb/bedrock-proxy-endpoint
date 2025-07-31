import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;

const baseURL = "http://localhost:88";
const apiKey = `${AWS_REGION}.${AWS_ACCESS_KEY_ID}.${AWS_SECRET_ACCESS_KEY}`;

const openai = new OpenAI({
    baseURL: baseURL,
    apiKey: apiKey,
});

async function testStopSequence() {
    console.log("Testing stop sequence with Claude model...\n");
    
    try {
        const response = await openai.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: "Count from 1 to 10. Put each number on its own line."
                }
            ],
            model: "Claude-4-Sonnet",
            max_tokens: 200,
            temperature: 0,
            stream: true,
            stop_sequences: ["5"]
        });

        console.log("Response:");
        let fullResponse = "";
        for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            fullResponse += content;
            process.stdout.write(content);
        }
        console.log("\n\n--- If stop sequences work, counting should stop before 5 ---");
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testStopSequence();