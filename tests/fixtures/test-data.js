// Test fixtures for API requests and responses

export const validAWSCredentials = {
  region: 'us-west-2',
  accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
}

export const validAPIKey = `${validAWSCredentials.region}.${validAWSCredentials.accessKeyId}.${validAWSCredentials.secretAccessKey}`

export const invalidAPIKeys = [
  'invalid.format',
  'us-west-2.INVALID_KEY.secret',
  'us-west-2.AKIAIOSFODNN7EXAMP.wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', // 19 chars instead of 20
  'region.access.secret.extra',
  null,
  undefined,
  ''
]

export const validChatRequest = {
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant.'
    },
    {
      role: 'user', 
      content: 'Hello, how are you?'
    }
  ],
  model: 'Claude-3-7-Sonnet',
  max_tokens: 100,
  temperature: 0.7,
  stream: true
}

export const invalidChatRequests = [
  {
    // Missing messages
    model: 'Claude-3-7-Sonnet'
  },
  {
    // Empty messages array
    messages: [],
    model: 'Claude-3-7-Sonnet'
  }
]

export const mockModelsResponse = {
  object: 'list',
  data: [
    {
      id: 'Claude-3-7-Sonnet',
      object: 'model',
      created: 1677610602,
      owned_by: 'anthropic'
    },
    {
      id: 'Claude-3-7-Haiku',
      object: 'model', 
      created: 1677610602,
      owned_by: 'anthropic'
    }
  ]
}

export const mockStreamResponse = [
  'Hello',
  ' there!',
  ' How',
  ' can',
  ' I',
  ' help',
  ' you',
  ' today?'
]