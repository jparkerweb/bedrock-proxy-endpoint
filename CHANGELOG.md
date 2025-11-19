# Changelog
All notable changes to this project will be documented in this file.

## [2.7.0] - 2025-11-19
### ✨ Added
- Support for DeepSeek & Qwen 3 models
  - DeepSeek-R1
  - DeepSeek V3.1
  - Qwen3 32b
  - Qwen3 235b
  - Qwen3 Coder 30b
  - Qwen3 Coder 480b

## [2.6.2] - 2025-10-16
### ✨ Added
- Support for Claude Haiku 4.5 models
  - Claude-4-5-Haiku
  - Claude-4-5-Haiku-Thinking

## [2.6.1] - 2025-09-30 (Claude Sonnet 4.5)
### ✨ Added
- Support for Claude Sonnet 4.5 models
  - Claude-4-5-Sonnet
  - Claude-4-5-Sonnet-Thinking

## [2.6.0] - 2025-09-27
### ✨ Added
- Docker support
  - Dockerfile and Docker commands added
  - GitHub Actions workflow for Docker build and publish to GitHub Container Registry
  - Documentation for Docker usage (docker run / docker compose)

## [2.5.0] - 2025-08-12
### ✨ Added
- Updated to use Bedrock Wrapper v2.5.0
- Support for AWS Bedrock Converse API via `use_converse_api` parameter
  - Optional boolean parameter that defaults to `false` for backward compatibility
  - When set to `true`, uses the unified Converse API instead of Invoke API
  - Provides consistent request/response format across all model families
  - Simplifies conversation management and multimodal handling
  - Better support for system prompts and tool use (where applicable)
- Converse API benefits include:
  - Unified API format across Claude, Nova, GPT-OSS, Llama, and Mistral models
  - Cleaner handling of thinking models with proper `reasoningContent` extraction
  - Simplified message format without model-specific prompt construction
  - Native support for system prompts as a separate field

### 🛠️ Technical Details
- The `use_converse_api` parameter follows the same pattern as `include_thinking_data`
- Passes through to bedrock-wrapper's `useConverseAPI` option
- Works with both streaming and non-streaming responses
- Maintains full backward compatibility when not specified or set to `false`

## [2.4.5] - 2025-08-06
### ✨ Added
- Updated to use Bedrock Wrapper v2.4.5
- Support for OpenAI GPT-OSS models on AWS Bedrock
  - GPT-OSS-120B (120B parameter open weight model)
  - GPT-OSS-20B (20B parameter open weight model)
  - GPT-OSS-120B-Thinking (with reasoning tag preservation)
  - GPT-OSS-20B-Thinking (with reasoning tag preservation)
- `<reasoning>` tag processing for GPT-OSS thinking variants
  - Regular GPT-OSS models automatically strip `<reasoning>` tags
  - Thinking variants preserve `<reasoning>` tags (similar to Claude's `<think>` tags)

## [2.4.4] - 2025-08-05
### ✨ Added
- Updated to use Bedrock Wrapper v2.4.4
- Support for Claude Opus 4.1 models:
  - Claude-4-1-Opus (with image support)
  - Claude-4-1-Opus-Thinking (with image support)

## [2.4.3] - 2025-07-31
### ✨ Added
- Updated to use Bedrock Wrapper v2.4.3
- Refined stop sequences support with model-specific limitations:
  - Claude models: Full support (up to 8,191 sequences)
  - Nova models: Full support (up to 4 sequences) 
  - Mistral models: Full support (up to 10 sequences)
  - Llama models: No stop sequences support (AWS Bedrock limitation)
- Improved error handling for early response termination
- Fixed Nova model configuration conflicts

## [2.4.2] - 2025-07-31
### ✨ Added
- Updated to use Bedrock Wrapper v2.4.2
- Support for Claude 4 models:
  - Claude-4-Opus (with image support)
  - Claude-4-Opus-Thinking (with image support)
  - Claude-4-Sonnet (with image support)  
  - Claude-4-Sonnet-Thinking (with image support)
- Stop sequences support (`stop_sequences` parameter)
- Compatible with OpenAI's `stop` parameter for controlling generation stopping points

## [2.4.1] - 2025-07-24
### ✨ Added
- Updated to use Bedrock Wrapper v2.4.1
- Vision support for Claude 3 Haiku
- Support for Amazon Nova models:
  - Amazon Nova Micro (text-only, ultra-low latency)
  - Amazon Nova Lite (multimodal, low-cost)
  - Amazon Nova Pro (multimodal, high capability)

## [2.3.1] - 2025-05-28
### ✨ Added
- Updated to use Bedrock Wrapper v2.3.1
  - Support for Claude Sonnet 4
  - Support for Claude Opus 4

## [2.3.0] - 2025-02-27 - Claude Sonnet 3.7 + Vision
### ✨ Added
- Support for Claude Sonnet 3.7
- Support for Clause Sonnet 3.7 Thinking
- Support for Claude Sonnet 3.x Vision

## [2.2.0] - 2025-01-01 - Llama 3.3 70b
### ✨ Added
- Support for Llama 3.3 70b

## [2.1.0] - 2024-11-21 - Claude Haiku 3.5
### ✨ Added
- Support for "Anthropic Claude 3.5 Haiku"

## [2.0.0] - 2024-10-31 - Claude
### ✨ Added
- Updated to use Bedrock Wrapper v2.0.0
- Model support for:
  - Claude 3.5 Sonnet V2
  - Claude 3.5 Sonnet
  - Claude 3 Haiku
- Unstreamed response are returned as a string similar to streaming responses
    > Note: This could be a breaking change for any clients that are expecting a JSON response from unstreamed responses

## [1.0.9] - 2024-09-25 - Lamma 3.2
### ✨ Added
- Model support for:
  - Llama 3.2 1b
  - Llama 3.2 3b
  - Llama 3.2 11b
  - Llama 3.2 90b


## [1.0.7] - 2024-07-24 - Lamma 3.1
### ✨ Added
- Model support for:
  - Llama-3-1-8b
  - Llama-3-1-70b


## [1.0.3] - 2024-05-06 - Initial Stable Release
### ✨ Added
- OpenAI API compatible proxy endpoint for AWS Bedrock
- Support for HTTP and HTTPS servers
- IP-based rate limiting
- Environment variable configuration
- AWS IAM authentication via API key
- Streaming and non-streaming responses
- `/models` endpoint to list supported models
- Root info page with documentation
- Endpoint type
  - `/chat/completions`
- Model Support for:
  - Llama-3-8b
  - Llama-3-70b
  - Mistral-7b
  - Mixtral-8x7b
  - Mistral-Large
- Error handling middleware
- Console logging toggle

### 🛡️ Security
- HTTPS support with custom key and certificate paths
- Rate limiting configuration options
- AWS IAM authentication required for API access

### 📚 Documentation
- Installation instructions
- Configuration guide
- Authentication details
- Usage examples
- API endpoint documentation 
