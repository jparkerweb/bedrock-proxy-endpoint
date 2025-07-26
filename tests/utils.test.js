import { describe, it, expect } from 'vitest'
import { toBoolean, extractAWSCreds } from '../utils.js'
import { validAPIKey, invalidAPIKeys } from './fixtures/test-data.js'

describe('toBoolean', () => {
  it('should return true for truthy string values', () => {
    expect(toBoolean('true')).toBe(true)
    expect(toBoolean('TRUE')).toBe(true)
    expect(toBoolean('True')).toBe(true)
    expect(toBoolean('yes')).toBe(true)
    expect(toBoolean('YES')).toBe(true)
    expect(toBoolean('1')).toBe(true)
    expect(toBoolean(' true ')).toBe(true) // with whitespace
  })

  it('should return false for falsy string values', () => {
    expect(toBoolean('false')).toBe(false)
    expect(toBoolean('FALSE')).toBe(false)
    expect(toBoolean('no')).toBe(false)
    expect(toBoolean('NO')).toBe(false)
    expect(toBoolean('0')).toBe(false)
    expect(toBoolean('')).toBe(false)
    expect(toBoolean('null')).toBe(false)
    expect(toBoolean('undefined')).toBe(false)
    expect(toBoolean(' false ')).toBe(false) // with whitespace
  })

  it('should return false for unknown string values', () => {
    expect(toBoolean('maybe')).toBe(false)
    expect(toBoolean('random')).toBe(false)
    expect(toBoolean('2')).toBe(false)
  })

  it('should return false when no parameter is provided', () => {
    expect(toBoolean()).toBe(false)
  })

  it('should handle edge cases', () => {
    expect(toBoolean('  ')).toBe(false) // only whitespace
    expect(toBoolean('\t\n')).toBe(false) // tabs and newlines
  })
})

describe('extractAWSCreds', () => {
  it('should extract valid AWS credentials', () => {
    const result = extractAWSCreds(validAPIKey)
    
    expect(result.error).toBe(false)
    expect(result.credentials).toEqual({
      AWS_REGION: 'us-west-2',
      AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',
      AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
    })
  })

  it('should reject invalid API key formats', () => {
    invalidAPIKeys.forEach(invalidKey => {
      const result = extractAWSCreds(invalidKey)
      expect(result.error).toBe(true)
      expect(result.message).toBe('Invalid AWS API key')
    })
  })

  it('should validate access key ID format', () => {
    // Access key doesn't start with AKIA
    const invalidAKIA = 'us-west-2.BKIAIOSFODNN7EXAMPLE.wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
    const result = extractAWSCreds(invalidAKIA)
    
    expect(result.error).toBe(true)
    expect(result.message).toBe('Invalid AWS API key')
  })

  it('should validate access key ID length', () => {
    // Access key too short (19 characters instead of 20)
    const shortKey = 'us-west-2.AKIAIOSFODNN7EXAMPL.wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
    const result = extractAWSCreds(shortKey)
    
    expect(result.error).toBe(true)
    expect(result.message).toBe('Invalid AWS API key')
  })

  it('should validate number of parts in token', () => {
    // Too few parts
    const tooFewParts = 'us-west-2.AKIAIOSFODNN7EXAMPLE'
    let result = extractAWSCreds(tooFewParts)
    expect(result.error).toBe(true)

    // Too many parts
    const tooManyParts = 'us-west-2.AKIAIOSFODNN7EXAMPLE.secret.extra.part'
    result = extractAWSCreds(tooManyParts)
    expect(result.error).toBe(true)
  })

  it('should handle edge cases', () => {
    // Empty string
    let result = extractAWSCreds('')
    expect(result.error).toBe(true)
    
    // Just dots
    result = extractAWSCreds('...')
    expect(result.error).toBe(true)
  })
})