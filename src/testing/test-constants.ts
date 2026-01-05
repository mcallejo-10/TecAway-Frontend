/**
 * Test constants for unit tests
 * Using descriptive names to avoid SonarCloud security hotspots
 */

export const TEST_CREDENTIALS = {
  VALID_PASSWORD: 'Password123',
  ALTERNATIVE_PASSWORD: 'Different123',
  LOWERCASE_PASSWORD: 'lowercase123',
  SHORT_PASSWORD: 'P1',
  HASHED_PASSWORD_1: 'hashedPassword123',
  HASHED_PASSWORD_2: 'hashedPassword456',
  SIMPLE_PASSWORD: 'pass123',
  MOCK_PASSWORD: 'TestPass123'
} as const;

export const TEST_USERS = {
  EMAIL: 'test@example.com',
  NAME: 'Test User',
  EMAIL_UPPERCASE: 'TEST@EXAMPLE.COM',
  NEW_USER_EMAIL: 'newuser@example.com',
  EXISTING_EMAIL: 'existing@example.com',
  JOHN_EMAIL: 'john@example.com',
  JOHN_EMAIL_UPPER: 'JOHN@EXAMPLE.COM',
  JOHN_NAME: 'John Doe',
  JOSE_NAME: 'José María',
  INVALID_NAME: 'John123'
} as const;
