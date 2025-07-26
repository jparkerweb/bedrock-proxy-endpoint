import { vi } from 'vitest'

// Mock the bedrock-wrapper module
vi.mock('bedrock-wrapper', () => ({
  bedrockWrapper: vi.fn(),
  listBedrockWrapperSupportedModels: vi.fn()
}))

// Mock dotenv
vi.mock('dotenv', () => ({
  default: {
    config: vi.fn()
  }
}))

// Setup test environment variables
process.env.CONSOLE_LOGGING = 'false'
process.env.HTTP_ENABLED = 'true'
process.env.HTTP_PORT = '3000'
process.env.HTTPS_ENABLED = 'false'
process.env.IP_RATE_LIMIT_ENABLED = 'false'
process.env.MAX_REQUEST_BODY_SIZE = '50mb'

// Mock console.log to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}