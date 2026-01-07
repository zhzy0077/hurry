# Walkthrough: Quick LLM Chat

## Changes

### Backend
-   **Created `src-tauri/src/llm.rs`**: Implements `LlmConfig` structure, persistence logic (Env Vars > JSON file), and `chat_completion` command using `reqwest`.
-   **Modified `src-tauri/src/lib.rs`**: Registered `save_llm_config`, `get_llm_config`, and `chat_completion` commands.
-   **Dependencies**: Utilized existing `reqwest` and `serde` dependencies.

### Frontend
-   **Refactored `index.html`**: Converted to a single-page app with Tab Navigation (Quick Chat | Memos).
-   **Created `src/chat.ts`**: TypeScript logic to handle state, configuration loading/saving, chat interaction, and Markdown rendering.
-   **Removed**: `chat.html` and `memos.html` (merged into index).

## Verification Tips

### Manual Testing
1.  **Open the App**: You should see "Quick Chat" as the default tab.
2.  **Initial State**: You should see the settings modal if no configuration exists (or click the gear icon).
3.  **Configuration**:
    -   Enter a valid OpenAI-compatible endpoint (e.g., `https://api.openai.com/v1/chat/completions`).
    -   Enter your API Key.
    -   Enter a model (e.g., `gpt-3.5-turbo`).
    -   Click Save.
4.  **Chatting**:
    -   Type "Hello world" and send.
    -   Evaluate speed: Characters should appear in real-time.
    -   Verify markdown rendering updates as text arrives.
5.  **Persistence**: Restart the app and return to Chat. Settings should optionally be pre-loaded (or active). The app checks config on load.
6.  **Environment Variables**:
    -   Create a `.env` file in the project root (or set system env vars) with `LLM_ENDPOINT`, `LLM_APIKEY`, `LLM_MODEL`.
    -   Restart the app. The chat should work using these values without manual configuration.

### Code Check
-   Check `Cargo.toml` includes `stream` feature for `reqwest`.
-   Check `chat.ts` listens for `llm-token` events.
