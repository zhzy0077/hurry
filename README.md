# Hurry

You're hurry, aren't you?

## Features

### 🤖 AI Quick Chat
Quick access to LLM chat for rapid Q&A sessions. Get instant answers without leaving your workflow.

![AI Quick Chat](docs/AI%20Quick%20Chat.png)

**Features:**
- Simple single-turn chat interface
- Support for various LLM providers (OpenAI, Anthropic, Ollama)
- Clean, distraction-free interface
- Instant access with keyboard shortcuts

### 📝 Memo Quick Note
Capture thoughts and notes instantly, with seamless integration to Memos service.

![Memo Quick Note](docs/Memo%20Quick%20Note.png)

**Features:**
- Quick note capture interface
- Auto-sync with Memos service
- Centered, focused writing experience
- Fast submission and status feedback

### ⚡ Quick Access
- **Alt+V** to show/hide the app from anywhere
- **Tab key** to switch between Chat and Memos views
- Auto-focus on input fields
- Lightweight and fast startup
- Native desktop performance

## Installation

### Prerequisites
- [Rust](https://www.rust-lang.org/tools/install) (for building from source)
- [Node.js](https://nodejs.org/) (v18 or later)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd hurry
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

For **AI Chat**, set your LLM API credentials in environment variables:
- `LLM_ENDPOINT` - Your LLM API endpoint (e.g., https://api.openai.com/v1/chat/completions, http://localhost:11434/v1/chat/completions for Ollama)
- `LLM_APIKEY` - Your API key
- `LLM_MODEL` - The model to use (e.g., gpt-4, claude-3-5-sonnet-20241022, llama2)

For **Memos integration**, set:
- `MEMOS_URL` - Your Memos instance URL
- `MEMOS_TOKEN` - Your Memos access token

Alternatively, create a config file in your user profile directory.

## Development

Run in development mode:
```bash
npm run tauri dev
```

## Building

Build for production:
```bash
npm run tauri build
```

The compiled application will be available in `src-tauri/target/release/`.

## Usage

1. **Launch the app** - Hurry opens with the AI Chat view by default
2. **AI Chat View**:
   - Type your question in the input field
   - Press Enter or click "Send" to get a response
   - Responses appear in the output area above
3. **Switch to Memos**: Press **Tab** to switch to the Memo view
4. **Memo View**:
   - Type your note in the text area
   - Click "Submit" to save to your Memos instance
   - Status messages confirm successful submission

## Tech Stack

- **Frontend**: Vanilla TypeScript, Vite, HTML/CSS
- **Backend**: Rust, Tauri v2
- **Markdown Rendering**: marked.js
- **Build Tool**: Vite + Tauri CLI

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## License

This project is licensed under the MIT License.
