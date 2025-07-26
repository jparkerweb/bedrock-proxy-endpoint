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
- `CONSOLE_LOGGING` - Enable/disable console logging (boolean)
- `HTTP_ENABLED` - Enable/disable HTTP server (boolean)
- `HTTP_PORT` - HTTP server port
- `HTTPS_ENABLED` - Enable/disable HTTPS server (boolean)
- `HTTPS_PORT` - HTTPS server port (requires cert files)
- `HTTPS_KEY_PATH` - Path to HTTPS private key file
- `HTTPS_CERT_PATH` - Path to HTTPS certificate file
- `IP_RATE_LIMIT_ENABLED` - Enable/disable IP-based rate limiting (boolean)
- `IP_RATE_LIMIT_WINDOW_MS` - Rate limit window in milliseconds
- `IP_RATE_LIMIT_MAX_REQUESTS` - Max requests per IP per window
- `MAX_REQUEST_BODY_SIZE` - Max request body size (for handling base64 images)

### Adding New Models

To add support for new AWS Bedrock models:
1. Update the supported models list in the bedrock-wrapper dependency
2. Test with the example scripts in `/example` directory
3. Update CHANGELOG.md with the new model support

### Testing

The project uses **Vitest** as the testing framework with comprehensive test coverage for core functionality.

#### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run a specific test file
npm test -- utils.test.js
```

#### Test Structure
```
tests/
├── setup.js              # Test configuration and mocks
├── utils.test.js          # Unit tests for utility functions
├── server.test.js         # API endpoint tests
└── fixtures/              # Test data and mock responses
    └── test-data.js
```

#### What's Tested
- **Utils Functions**: `toBoolean()` and `extractAWSCreds()` with various inputs and edge cases
- **API Endpoints**: All server endpoints with authentication, validation, and error handling
- **Authentication**: AWS credential extraction and validation
- **Request/Response**: Chat completion requests, streaming responses, and error scenarios

#### Manual Testing
You can also manually test functionality:
1. Use the example scripts in `/example` to test functionality:
   - `example.js` - Basic text completion with streaming
   - `example-vision.js` - Vision model example with image processing
2. Use the `/test/chat/completions` endpoint for quick tests
3. Test different models by updating the `model` parameter in examples

### Important Considerations

- The server uses ES modules (not CommonJS)
- No TypeScript - pure JavaScript
- Rate limiting is IP-based using express-rate-limit
- The bedrock-wrapper package handles all AWS SDK interactions
- Console logging can be toggled via CONSOLE_LOGGING env var for debugging
- Both HTTP and HTTPS can be enabled simultaneously
- AWS credentials are validated by checking for proper AKIA prefix and 20-character length
- Error handling includes specific ThrottlingException handling for rate limits
- Vision models support base64 images and require larger MAX_REQUEST_BODY_SIZE
- The `include_thinking_data` parameter enables thinking process output for compatible models