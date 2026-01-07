use futures::StreamExt;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::env;
use std::fs;
use std::path::PathBuf;
use tauri::{Emitter, WebviewWindow};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct LlmConfig {
    pub endpoint: String,
    pub apikey: String,
    pub model: String,
}

impl LlmConfig {
    fn get_config_path() -> Option<PathBuf> {
        if let Ok(user_profile) = env::var("USERPROFILE") {
            let mut path = PathBuf::from(user_profile);
            path.push(".hurry");
            // Ensure dir exists handled during save
            path.push("llm_config.json");
            return Some(path);
        }
        None
    }

    pub fn load() -> Result<Self, String> {
        // Load .env file
        let _ = dotenvy::dotenv();

        // 1. Try Env Vars
        let env_endpoint = env::var("LLM_ENDPOINT");
        let env_apikey = env::var("LLM_APIKEY");
        let env_model = env::var("LLM_MODEL");

        if let (Ok(endpoint), Ok(apikey), Ok(model)) = (env_endpoint, env_apikey, env_model) {
            return Ok(LlmConfig {
                endpoint,
                apikey,
                model,
            });
        }

        // 2. Try Config File
        if let Some(path) = Self::get_config_path() {
            if path.exists() {
                let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
                let config: LlmConfig =
                    serde_json::from_str(&content).map_err(|e| e.to_string())?;
                return Ok(config);
            }
        }
        // Return default empty or specific error
        Err(
            "Configuration not found (Env: LLM_ENDPOINT, LLM_APIKEY, LLM_MODEL or ~/.hurry/llm_config.json)"
                .to_string(),
        )
    }
}

#[derive(Serialize)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct ChatRequest {
    model: String,
    messages: Vec<ChatMessage>,
    stream: bool,
}

// SSE streaming response structures
#[derive(Deserialize, Debug)]
struct ChatStreamResponse {
    choices: Vec<StreamChoice>,
}

#[derive(Deserialize, Debug)]
struct StreamChoice {
    delta: StreamDelta,
}

#[derive(Deserialize, Debug)]
struct StreamDelta {
    content: Option<String>,
}

#[tauri::command]
pub async fn chat_completion(window: WebviewWindow, prompt: String) -> Result<(), String> {
    let config = LlmConfig::load()?;

    let client = Client::new();
    let body = ChatRequest {
        model: config.model,
        messages: vec![
            ChatMessage {
                role: "system".to_string(),
                content: "Reply with the shortest answer. For shell commands, just the command. NO STYLE."
                    .to_string(),
            },
            ChatMessage {
                role: "user".to_string(),
                content: prompt,
            },
        ],
        stream: true,
    };

    let response = client
        .post(&config.endpoint)
        .header("Authorization", format!("Bearer {}", config.apikey))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("API Error: {}", response.status()));
    }

    let mut stream = response.bytes_stream();
    let mut buffer = String::new();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        let s = String::from_utf8_lossy(&chunk);
        buffer.push_str(&s);

        // Process SSE lines
        while let Some(pos) = buffer.find('\n') {
            let line = buffer[..pos].trim().to_string();
            buffer.drain(..pos + 1);

            if line.starts_with("data: ") {
                let data = &line[6..];
                if data == "[DONE]" {
                    let _ = window.emit("llm-finished", ());
                    return Ok(());
                }

                if let Ok(parsed) = serde_json::from_str::<ChatStreamResponse>(data) {
                    if let Some(choice) = parsed.choices.first() {
                        if let Some(content) = &choice.delta.content {
                            let _ = window.emit("llm-token", content);
                        }
                    }
                }
            }
        }
    }

    let _ = window.emit("llm-finished", ());
    Ok(())
}
