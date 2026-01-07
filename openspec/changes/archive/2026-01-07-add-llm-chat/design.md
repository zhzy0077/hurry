# Design: Quick LLM Chat

## Architecture

### Configuration Management
-   **Storage**: Configuration (Endpoint, Model, API Key) will be stored persistently.
    -   *Option A*: Simple JSON/TOML config file in the app data directory.
    -   *Option B*: Environment variables (less user-friendly for a desktop app UI).
    -   *Decision*: Use a persistent configuration file structure similar to the Memos integration usage (if exists), or a new `llm_config.json` in the app data folder. The API Key should ideally be treated with care, but for this MVP/feature, a local config file is acceptable if OS keychain is too complex for now. We will stick to a simple config implementation for "quick" support.

### Backend (Rust/Tauri)
-   **Commands**:
    -   `save_llm_config`: Accepts endpoint, key, model.
    -   `get_llm_config`: Returns current config (masking key for UI if needed).
    -   `chat_completion`: Accepts a prompt/message history, calls the LLM endpoint.
-   **Networking**: Use `reqwest` (or Tauri's HTTP plugin if available/preferred) to make POST requests to the user-defined compatible endpoint.
-   **Streaming**: For a better UX, Server-Sent Events (SSE) or a streaming response is preferred. Tauri v2 supports channels or events. For "Quick" chat, we can start with full-response waiting, but streaming is better design. *Decision*: Target streaming if feasible with standard reqwest + Tauri logic, otherwise fallback to request-response.

### Frontend (Web UI)
-   **Settings**: A simple way to configure Endpoint, Key, Model (e.g., a settings modal or a clean configuration section).
-   **Chat Interface**:
    -   **Input**: Text area for the user's prompt.
    -   **Output**: Area to display the AI's response (Markdown rendered).
    -   **Interaction**: Single-turn interaction. New queries replace or clear the previous output.

## Security Considerations
-   API Keys are sensitive. Storing them in a plain text config file is a risk. We should ensure the file is in a user-protected directory.

## Open Questions
-   Should we support conversation history? **No**. The user explicitly requested no session history. This is a quick Q&A tool.
