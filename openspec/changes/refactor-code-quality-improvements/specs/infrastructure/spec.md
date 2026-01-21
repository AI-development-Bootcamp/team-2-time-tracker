## MODIFIED Requirements
### Requirement: Purpose Documentation
The infrastructure specification SHALL include a clear Purpose section that describes the document's objective, scope, intended audience, and what infrastructure decisions, configuration requirements, and deployment patterns it documents.

#### Scenario: Purpose section clarity
- **WHEN** a developer or DevOps engineer reads the infrastructure spec Purpose section
- **THEN** they immediately understand the document's scope, intended audience, and what infrastructure concerns are covered

### Requirement: Environment Configuration
The system SHALL validate all environment variables at startup using Zod schemas and fail fast if required variables are missing.

#### Scenario: Missing required variable
- **WHEN** `DATABASE_URL` environment variable is not set and `NODE_ENV` is not 'test'
- **THEN** the server fails to start with a clear error message

#### Scenario: Invalid variable format
- **WHEN** `JWT_EXPIRY` is set to a non-numeric value
- **THEN** the server fails to start with a validation error

#### Scenario: DATABASE_URL optional in test
- **WHEN** `DATABASE_URL` is not set and `NODE_ENV` is 'test'
- **THEN** the server may use a test fallback database URL for testing purposes
