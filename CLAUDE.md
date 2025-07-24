# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bedrock Proxy Endpoint is a proxy server that provides an OpenAI-compatible API interface for AWS Bedrock LLM services. It translates OpenAI API requests to AWS Bedrock calls, allowing developers to use standard OpenAI client libraries with AWS Bedrock models.

## Common Development Commands

### Running the Server
```bash
# Start the server
npm run server
# or
npm start
```

### Managing Dependencies
```bash
# Clean install dependencies
npm run clean
```

## Architecture Overview

### Core Components

1. **server.js** - Main Express server that:
   - Implements OpenAI-compatible endpoints (`/models`, `/chat/completions`)
   - Handles authentication by extracting AWS credentials from the API key
   - Manages rate limiting and request routing
   - Supports both streaming and non-streaming responses

2. **utils.js** - Utility functions for:
   - Boolean conversion from environment variables
   - AWS credential extraction from API key format

3. **bedrock-wrapper** - NPM dependency that handles:
   - AWS Bedrock API integration
   - Model-specific request/response transformations
   - Streaming response handling

### Authentication Pattern

The proxy uses a unique authentication approach where AWS credentials are passed through the OpenAI API key parameter:
- Format: `${AWS_REGION}.${AWS_ACCESS_KEY_ID}.${AWS_SECRET_ACCESS_KEY}`
- Example: `us-west-2.AKIAWSXXXXXXXXXXX.YYYYYYYYYYYYYYYYYYYYYYYYY`

This is extracted in `utils.extractAWSCreds()` and used to configure the AWS SDK.

### Key API Endpoints

- `GET /` - Serves the info page (public/index.html)
- `GET /models` - Returns supported Bedrock models list
- `POST /chat/completions` - Main proxy endpoint (OpenAI-compatible)
- `POST /test/chat/completions` - Test endpoint for development

### Environment Configuration

The server uses `.env` for configuration:
- `CONSOLE_LOG` - Enable/disable console logging
- `HTTP_PORT` - HTTP server port
- `HTTPS_PORT` - HTTPS server port (requires cert files)
- `RATE_LIMIT_MAX` - Max requests per IP per window
- `RATE_LIMIT_WINDOW_MINUTES` - Rate limit time window
- `REQUEST_SIZE_LIMIT` - Max request body size

### Adding New Models

To add support for new AWS Bedrock models:
1. Update the supported models list in the bedrock-wrapper dependency
2. Test with the example scripts in `/example` directory
3. Update CHANGELOG.md with the new model support

### Testing Changes

While there's no formal test suite, you can:
1. Use the example scripts in `/example` to test functionality
2. Test streaming responses with `example-stream.js`
3. Test vision capabilities with `example-vision.js`
4. Use the `/test/chat/completions` endpoint for quick tests

### Important Considerations

- The server uses ES modules (not CommonJS)
- No TypeScript - pure JavaScript
- Rate limiting is IP-based using express-rate-limit
- The bedrock-wrapper package handles all AWS SDK interactions
- Console logging can be toggled via CONSOLE_LOG env var for debugging