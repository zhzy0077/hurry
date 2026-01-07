# Change: Add LLM Chat

## Why
Users need a quick way to interact with LLMs (Large Language Models) for assistance, coding, or general queries directly within the application, utilizing their own API credentials.

## What Changes
-   **Configuration**: Allow users to configure LLM settings in an OpenAI-compatible format:
    -   `ENDPOINT`: The API endpoint URL (e.g., https://api.openai.com/v1).
    -   `APIKEY`: The secret API key.
    -   `MODEL`: The model name (e.g., gpt-4o).
-   **Chat Interface**: A minimalist UI to send messages and receive responses from the configured LLM.
-   **Backend**: Rust implementation to handle safe storage of keys (if applicable) or simple config management, and proxying requests to the LLM provider.

## Impact
-   **New Specs**: `llm-configuration`, `chat-interface`
-   **Affected Components**: `src-tauri` (backend logic), `src` (frontend UI)
