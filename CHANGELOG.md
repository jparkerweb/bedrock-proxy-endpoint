# Changelog
All notable changes to this project will be documented in this file.

## [2.4.0] - 2025-03-29 - Docker Builds
- Support Docker Builds
  - `.dockerignore`
    -Added .env and node_modules to the .dockerignore file to exclude them from the Docker image.
  - `.github/workflows/docker.yml`
    - Created a new GitHub Actions workflow to build and publish Docker images to GHCR.
    - The workflow is triggered on push events to tags.
    - The workflow converts the repository name to lowercase.
    - The workflow logs into GHCR using GitHub Actions secrets.
    - The workflow builds and pushes the Docker image with 'latest' and tag-based tags.
  - `Dockerfile`
    - Created a Dockerfile to define the application's Docker image.
    - The Dockerfile uses node:22.14.0 as the base image.
    - The Dockerfile sets the working directory to /app.
    - The Dockerfile copies package*.json, installs dependencies, copies the remaining project files, and defines the start command.

## [2.3.0] - 2025-02-27 - Claude Sonnet 3.7 + Vision
### Added
- Support for Claude Sonnet 3.7
- Support for Clause Sonnet 3.7 Thinking
- Support for Claude Sonnet 3.x Vision

## [2.2.0] - 2025-01-01 - Llama 3.3 70b
### Added
- Support for Llama 3.3 70b

## [2.1.0] - 2024-11-21 - Claude Haiku 3.5
### Added
- Support for "Anthropic Claude 3.5 Haiku"

## [2.0.0] - 2024-10-31 - Claude
### Added
- Updated to use Bedrock Wrapper v2.0.0
- Model support for:
  - Claude 3.5 Sonnet V2
  - Claude 3.5 Sonnet
  - Claude 3 Haiku
- Unstreamed response are returned as a string similar to streaming responses
    > Note: This could be a breaking change for any clients that are expecting a JSON response from unstreamed responses

## [1.0.9] - 2024-09-25 - Lamma 3.2
### Added
- Model support for:
  - Llama 3.2 1b
  - Llama 3.2 3b
  - Llama 3.2 11b
  - Llama 3.2 90b


## [1.0.7] - 2024-07-24 - Lamma 3.1
### Added
- Model support for:
  - Llama-3-1-8b
  - Llama-3-1-70b


## [1.0.3] - 2024-05-06 - Initial Stable Release
### Added
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

### Security
- HTTPS support with custom key and certificate paths
- Rate limiting configuration options
- AWS IAM authentication required for API access

### Documentation
- Installation instructions
- Configuration guide
- Authentication details
- Usage examples
- API endpoint documentation 
