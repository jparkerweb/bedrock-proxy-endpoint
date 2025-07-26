import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import { bedrockWrapper, listBedrockWrapperSupportedModels } from 'bedrock-wrapper'
import { extractAWSCreds } from '../utils.js'
import { 
  validAPIKey, 
  invalidAPIKeys, 
  validChatRequest, 
  invalidChatRequests, 
  mockModelsResponse,
  mockStreamResponse 
} from './fixtures/test-data.js'

// Mock the dependencies
vi.mock('bedrock-wrapper')
vi.mock('dotenv', () => ({
  default: { config: vi.fn() }
}))

// Mock fs for serving static files
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  default: {
    readFileSync: vi.fn()
  }
}))

// Mock console output
vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'warn').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})

describe('Server API Endpoints', () => {
  let app

  beforeEach(() => {
    // Create a minimal Express app for testing individual endpoints
    app = express()
    app.use(bodyParser.json({ limit: '50mb' }))
    
    // Mock the bedrock-wrapper functions
    listBedrockWrapperSupportedModels.mockResolvedValue(mockModelsResponse)
    
    // Set up routes manually for testing (mirroring actual server structure)
    app.get('/', (req, res) => {
      res.send('<html><body>Bedrock Proxy Endpoint</body></html>')
    })

    app.get('/models', async (req, res) => {
      try {
        const supportedModels = await listBedrockWrapperSupportedModels()
        res.json(supportedModels)
      } catch (err) {
        res.status(500).send('Failed to fetch models')
      }
    })

    app.post('/test/chat/completions', (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      })
      
      const data = {choices: [{delta: {
        content: "(ツ) → Test message from Bedrock Proxy Endpoint"
      }}]}
      res.write(`data: ${JSON.stringify(data)}\n\n`)
      res.end()
    })

    app.post('/chat/completions', async (req, res) => {
      const {
        messages = [],
        model = 'Llama-3-8b',
        max_tokens = 800,
        temperature = 0.1,
        top_p = 0.9,
        stream = true,
        include_thinking_data = false
      } = req.body

      // Validate messages array
      if (!messages.length) {
        res.status(400).send('Messages array is empty')
        return
      }

      // Extract AWS credentials from request (mirroring actual server logic)
      const bearerToken = req.rawHeaders?.find(item => item?.startsWith("Bearer "))
      const token = bearerToken ? bearerToken.substring(7) : null
      const tokenParts = extractAWSCreds(token)
      
      if (tokenParts.error) {
        res.status(401).send(tokenParts.message)
        return
      }

      const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = tokenParts.credentials

      if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
        res.status(401).send('Unauthorized')
        return
      }

      // Mock successful response
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      })

      if (stream) {
        // Mock streaming response
        bedrockWrapper.mockImplementation(async function* () {
          for (const chunk of mockStreamResponse) {
            yield chunk
          }
        })

        for await (const chunk of bedrockWrapper()) {
          const data = {choices: [{delta: { content: chunk }}]}
          res.write(`data: ${JSON.stringify(data)}\n\n`)
        }
      } else {
        // Mock non-streaming response
        const completeResponse = mockStreamResponse.join('')
        const data = {choices: [{message: { content: completeResponse }}]}
        res.write(JSON.stringify(data))
      }
      
      res.end()
    })
  })

  describe('GET /', () => {
    it('should return info page', async () => {
      const response = await request(app)
        .get('/')
        .expect(200)
      
      expect(response.text).toContain('Bedrock Proxy Endpoint')
    })
  })

  describe('GET /models', () => {
    it('should return supported models list', async () => {
      const response = await request(app)
        .get('/models')
        .expect(200)
      
      expect(response.body).toEqual(mockModelsResponse)
      expect(listBedrockWrapperSupportedModels).toHaveBeenCalled()
    })

    it('should handle errors when fetching models', async () => {
      listBedrockWrapperSupportedModels.mockRejectedValue(new Error('API Error'))
      
      await request(app)
        .get('/models')
        .expect(500)
        .expect('Failed to fetch models')
    })
  })

  describe('POST /test/chat/completions', () => {
    it('should return test message', async () => {
      const response = await request(app)
        .post('/test/chat/completions')
        .expect(200)
      
      expect(response.headers['content-type']).toBe('text/event-stream')
      expect(response.text).toContain('Test message from Bedrock Proxy Endpoint')
    })
  })

  describe('POST /chat/completions', () => {
    it('should process valid chat completion request', async () => {
      const response = await request(app)
        .post('/chat/completions')
        .set('Authorization', `Bearer ${validAPIKey}`)
        .send(validChatRequest)
        .expect(200)
      
      expect(response.headers['content-type']).toBe('text/event-stream')
      expect(response.text).toContain('Hello')
    })

    it('should reject request without authorization header', async () => {
      await request(app)
        .post('/chat/completions')
        .send(validChatRequest)
        .expect(401)
        .expect('Invalid AWS API key')
    })

    it('should reject request with invalid API key format', async () => {
      const testKeys = invalidAPIKeys.filter(key => key !== null && key !== undefined && key !== '')
      
      for (const invalidKey of testKeys) {
        await request(app)
          .post('/chat/completions')
          .set('Authorization', `Bearer ${invalidKey}`)
          .send(validChatRequest)
          .expect(401)
          .expect('Invalid AWS API key')
      }
      
      // Test null/undefined cases separately
      await request(app)
        .post('/chat/completions')
        .set('Authorization', 'Bearer ')
        .send(validChatRequest)
        .expect(401)
        .expect('Invalid AWS API key')
    })

    it('should reject request with empty messages array', async () => {
      await request(app)
        .post('/chat/completions')
        .set('Authorization', `Bearer ${validAPIKey}`)
        .send(invalidChatRequests[1]) // Empty messages array
        .expect(400)
        .expect('Messages array is empty')
    })

    it('should handle non-streaming requests', async () => {
      const nonStreamingRequest = {
        ...validChatRequest,
        stream: false
      }

      const response = await request(app)
        .post('/chat/completions')
        .set('Authorization', `Bearer ${validAPIKey}`)
        .send(nonStreamingRequest)
        .expect(200)
      
      expect(response.headers['content-type']).toBe('text/event-stream')
      const responseData = JSON.parse(response.text)
      expect(responseData.choices[0].message.content).toBe(mockStreamResponse.join(''))
    })

    it('should handle requests with custom parameters', async () => {
      const customRequest = {
        ...validChatRequest,
        model: 'Claude-3-7-Haiku',
        max_tokens: 200,
        temperature: 0.9,
        top_p: 0.5,
        include_thinking_data: true
      }

      await request(app)
        .post('/chat/completions')
        .set('Authorization', `Bearer ${validAPIKey}`)
        .send(customRequest)
        .expect(200)
    })
  })
})