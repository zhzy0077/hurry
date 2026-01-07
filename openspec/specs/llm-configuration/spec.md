# llm-configuration Specification

## Purpose
TBD - created by archiving change add-llm-chat. Update Purpose after archive.
## Requirements
### Requirement: User can configure LLM provider details
The system SHALL allow the user to input and save their LLM provider details, including Endpoint, API Key, and Model.

#### Scenario: User opens settings and enters their OpenAI-compatible details.
-   GIVEN the user is on the settings page
-   WHEN they enter an Endpoint "https://api.openai.com/v1", an API Key "sk-...", and a Model "gpt-4"
-   AND clicks "Save"
-   THEN the configuration is persisted
-   AND subsequent chat requests use these credentials.

### Requirement: System defaults to OpenAI public endpoint if unspecified
The system SHALL use OpenAI's public endpoint and a default model if the user has not provided specific configuration, though an API Key MUST still be provided by the user.

#### Scenario: Default configuration
-   GIVEN no configuration has been set
-   THEN the Endpoint defaults to "https://api.openai.com/v1"
-   AND the Model defaults to "gpt-3.5-turbo" (or empty, forcing user input).
-   *Refinement*: Better to force user input to avoid confusion.
-   THEN the system requires user to input details before chatting.

