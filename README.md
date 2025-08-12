# 🔀 Bedrock Proxy Endpoint
Spin up your own custom OpenAI API server endpoint for easy AWS Bedrock LLM text inference (using standard `baseUrl`, and `apiKey` params)

![bedrock-proxy-endpoint](https://raw.githubusercontent.com/jparkerweb/bedrock-proxy-endpoint/refs/heads/main/.readme/bedrock-proxy-endpoint.jpg)

### Maintained by
<a href="https://www.equilllabs.com">
  <img src="https://raw.githubusercontent.com/jparkerweb/eQuill-Labs/refs/heads/main/src/static/images/logo-text-outline.png" alt="eQuill Labs" height="40">
</a>

---

### Why Bedrock Proxy Endpoint?

Are you are stuck with using AWS Bedrock for all LLM text inference, but you want to keep your application platform agnostic?  Are you tired of figuring out how to format your LLM inference calls to work with the Bedrock SDK? Are you going crazy with all the differences between configuration from model to model?

- `Bedrock Proxy Endpoint` makes it easy to continue using the OpenAI API client that you are use to by standing up your own OpenAI text compatible endpoint that will proxy all your calls to Bedrock in a compatible way.

- Great for getting existing OpenAI API compatible applications working with AWS Bedrock.


### Prerequisites

Before getting started, make sure you have the following installed:

- Node.js (version 12 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/jparkerweb/bedrock-proxy-endpoint.git
    ```

2. Navigate to the project directory:

    ```bash
    cd bedrock-proxy-endpoint
    ```

3. Install the dependencies:

    ```bash
    npm ci
    ```

### Configuration

* Update the `.env` file in the root directory of the project with the following
  environment variables based on your desired configuration:

    | key                        | value type | example                   | notes                          |
    |----------------------------|------------|---------------------------|--------------------------------|
    | CONSOLE_LOGGING            | boolean    | false                     | Show realtime logs             |
    | HTTP_ENABLED               | boolean    | true                      | Start a HTTP server            |
    | HTTP_PORT                  | integer    | 80                        | HTTP server port               |
    | MAX_REQUEST_BODY_SIZE      | string     | 50mb                      | Maximum size for request body  |
    | HTTPS_ENABLED              | boolean    | false                     | Start a HTTPS server           |
    | HTTPS_PORT                 | integer    | 443                       | HTTPS server port              |
    | HTTPS_KEY_PATH             | string     | ./path/mykey.key          | Path to key file for HTTPS     |
    | HTTPS_CERT_PATH            | string     | ./path/mycert.pem         | Path to cert file for HTTPS    |
    | IP_RATE_LIMIT_ENABLED      | boolean    | true                      | Enable rate limiting by IP     |
    | IP_RATE_LIMIT_WINDOW_MS    | integer    | 60000                     | Window in milliseconds         |
    | IP_RATE_LIMIT_MAX_REQUESTS | integer    | 100                       | Max requests per IP per window |

### Authentication

`Bedrock Proxy` authenticates with AWS via `IAM`. Since the OpenAI API intance accpets an API Key we will utilize this value to hold your credentials. Construct your `apiKey` for inference in the next step following this format:

- `${AWS_REGION}.${AWS_ACCESS_KEY_ID}.${AWS_SECRET_ACCESS_KEY}`
- example `apiKey` value:  
  `us-west-2.AKIAWSXXXXXXXXXXX.YYYYYYYYYYYYYYYYYYYYYYYYY`

### Usage

- Start the server via: `node server`  

  <img src="docs/console.png">  

  You are now ready to make a standard chat completions to the server.

- Important values
  - `baseUrl`: Root address of server based on your `.env` configuration.
  - `apiKey`: Descibed in the *Authentication* section above.
  - `messages`: Array of objects in role / content format.
  - `model`: This is the `modelName` from the list of supported models found on the `Bedrock Wrapper` README file [here](https://github.com/jparkerweb/bedrock-wrapper?tab=readme-ov-file#supported-models); The `/models` enpoint of this server will also return a list of supported models.
  - `include_thinking_data`: _Optional_ boolean parameter that when set to `true` will include the model's thinking process in the response (only used with thinking models such as `Claude-3-7-Sonnet-Thinking`).
  - `use_converse_api`: _Optional_ boolean parameter that when set to `true` will use AWS Bedrock's Converse API instead of the Invoke API. The Converse API provides a unified request/response format across all models, better conversation management, and cleaner multimodal handling. Defaults to `false` for backward compatibility.
  - `stop` or `stop_sequences`: _Optional_ parameter to specify text sequences that will cause the model to stop generating (e.g., `["STOP", "END"]`).

### Example OpenAI API Call
Look at the example folder for complete examples of how to use the server:
- `example.js` - Basic text completion example
- `example-vision.js` - Vision model example with image processing (image can be passed as a base64 string or a URL)
- `example-stop-sequences.js` - Stop sequences example demonstrating how to control where generation stops

```javascript
import OpenAI from 'openai';

const messages = [
    {
        role: "system",
        content: "You are a helpful AI assistant that follows instructions extremely well. Answer the user questions accurately.",
    },
    {
        role: "user",
        content: "Describe why the OpenAI API standard is so great. Limit your response to five sentences.",
    },
    {
        role: "assistant",
        content: "",
    },
];

const baseURL = "http://localhost"; // URL of the Bedrock Proxy Endpoint
const apiKey = `${AWS_REGION}.${AWS_ACCESS_KEY_ID}.${AWS_SECRET_ACCESS_KEY}` // Your AWS Creds / API Key

const openai = new OpenAI({
    baseURL: baseURL,
    apiKey: apiKey,
});

async function main() {
    try {
        const chatCompletion = await openai.chat.completions.create({
            messages: messages,
            model: "Claude-4-Sonnet",
            max_tokens: 2048,
            temperature: 0.4,
            top_p: 0.7,
            stream: true,
            include_thinking_data: false,  // Set to true for thinking models like "Claude-4-Sonnet-Thinking"
            use_converse_api: false,  // Set to true to use the unified Converse API instead of Invoke API
        });

        if (chatCompletion) {
            for await (const chunk of chatCompletion) {
                const response = chunk.choices[0]?.delta?.content || "";
                process.stdout.write(response);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

main();
```

### Root Info Page

Point your browser to the root of your endpoint server to view the info page: (example: `http://localhost`)  

<img src="docs/bedrock-proxy-endpoint.png" style="max-width:700px">

### Note

Alternativly you can incorporate 🪨 <a href="https://github.com/jparkerweb/bedrock-wrapper" target="bedrockWrapper">`Bedrock Wrapper`</a> core directly into your code base. If you would like to explore that option checkout the npm package here: https://www.npmjs.com/package/bedrock-wrapper

---

Please consider sending me a tip to support my work 😀
# [🍵 tip me here](https://ko-fi.com/jparkerweb)
