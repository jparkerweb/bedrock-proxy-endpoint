# 🔀 Bedrock Proxy Endpoint

Bedrock Proxy Endpoint is an OpenAI‑compatible API server that proxies chat completions to AWS Bedrock. Keep your app platform‑agnostic and still use the OpenAI client/SDKs while running on Bedrock under the hood. Works with Invoke or the unified Converse API, supports streaming, stop sequences, and vision, and can run over HTTP or HTTPS with simple env‑based config.

**Quick start**
```bash
# Pull and run
docker pull jparkerweb/bedrock-proxy-endpoint:latest

docker run -d \
  --name bedrock-proxy-endpoint \
  -p 88:88 \
  -e HTTP_ENABLED=true \
  -e HTTP_PORT=88 \
  -e CONSOLE_LOGGING=true \
  jparkerweb/bedrock-proxy-endpoint:latest
```

**Docker Compose**
```yaml
version: '3.8'
services:
  bedrock-proxy-endpoint:
    image: jparkerweb/bedrock-proxy-endpoint:latest
    ports:
      - "88:88"
    environment:
      - HTTP_ENABLED=true
      - HTTP_PORT=88
      - CONSOLE_LOGGING=true
      - IP_RATE_LIMIT_ENABLED=true
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "const http = require('http'); const req = http.request({host: 'localhost', port: process.env.HTTP_PORT || 88, timeout: 2000}, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); req.on('error', () => process.exit(1)); req.end();"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Then run with: `docker-compose up -d`

### **Environment Variables**

All configuration is done via environment variables. Here are all available options:

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `CONSOLE_LOGGING` | boolean | `false` | Show realtime logs in console |
| `HTTP_ENABLED` | boolean | `true` | Start HTTP server |
| `HTTP_PORT` | integer | `88` | HTTP server port (default 88) |
| `MAX_REQUEST_BODY_SIZE` | string | `50mb` | Maximum size for request body |
| `HTTPS_ENABLED` | boolean | `false` | Start HTTPS server |
| `HTTPS_PORT` | integer | `443` | HTTPS server port |
| `HTTPS_KEY_PATH` | string | - | Path to key file for HTTPS |
| `HTTPS_CERT_PATH` | string | - | Path to cert file for HTTPS |
| `IP_RATE_LIMIT_ENABLED` | boolean | `true` | Enable rate limiting by IP |
| `IP_RATE_LIMIT_WINDOW_MS` | integer | `60000` | Rate limit window in milliseconds |
| `IP_RATE_LIMIT_MAX_REQUESTS` | integer | `100` | Max requests per IP per window |

**Note on Port 88**: This project defaults to port 88 instead of the typical 80/3000 to avoid conflicts with other services. You can change this by setting `HTTP_PORT` to your preferred port and updating the Docker port mapping accordingly.

---

### **Why Use It?**
- **Compatible surface**: Use standard OpenAI client (`baseURL`, `apiKey`), no Bedrock SDK refactors.
- **Fast adoption**: Drop‑in for existing OpenAI integrations and tools.
- **Broad model coverage**: Works with Bedrock models listed in Bedrock Wrapper's supported models.
- **Flexible runtime**: Docker image with sane defaults, rate limiting, and healthchecks.
- **Optional Converse API**: Unified request/response across models; backwards‑compatible default to Invoke.

### **Key Features**
- OpenAI Chat Completions compatible: `POST /v1/chat/completions`
- Models listing: `GET /models`
- Root info page for quick checks
- Streaming responses
- Stop sequences: `stop` or `stop_sequences`
- Thinking data passthrough: `include_thinking_data` for thinking models (e.g., Claude 3.7 Sonnet Thinking)
- Choose API mode: `use_converse_api=true|false`
- HTTP/HTTPS, configurable ports and request body size
- IP rate limiting

### **Auth Model**
- Uses AWS IAM via `apiKey` formatted as: `${AWS_REGION}.${AWS_ACCESS_KEY_ID}.${AWS_SECRET_ACCESS_KEY}`
- Example: `us-west-2.AKIA....XXXXXXXX.YYYYYYYYYYYYYYYYYYYY`

---

### **OpenAI Client Example (Node)**
```js
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "http://localhost", // your container endpoint
  apiKey: `${AWS_REGION}.${AWS_ACCESS_KEY_ID}.${AWS_SECRET_ACCESS_KEY}`,
});

const stream = await openai.chat.completions.create({
  model: "Claude-4-Sonnet",
  messages: [
    { role: "system", content: "You are a precise assistant." },
    { role: "user", content: "Explain OpenAI API benefits in five sentences." },
  ],
  stream: true,
  include_thinking_data: false, // set true for thinking models
  use_converse_api: false,      // set true to use Bedrock Converse API
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}
```

---

#### **Endpoints**
- GET `/` – info page
- GET `/models` – supported Bedrock models
- POST `/v1/chat/completions` – OpenAI‑compatible chat completions

#### **Notes**
- Vision supported (image as URL or base64) via OpenAI message format.
- The `/models` endpoint and Bedrock Wrapper docs list supported model IDs.

---

### **📋 Links**
- GitHub: https://github.com/jparkerweb/bedrock-proxy-endpoint
- Bedrock Wrapper (core): https://github.com/jparkerweb/bedrock-wrapper
- NPM: https://www.npmjs.com/package/bedrock-wrapper
