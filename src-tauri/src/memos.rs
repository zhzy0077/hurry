use serde::{Deserialize, Serialize};
use std::env;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct MemosConfig {
    pub url: String,
    pub token: String,
}

impl MemosConfig {
    pub fn load() -> Result<Self, String> {
        // Load .env file if it exists (ignore error if missing)
        let _ = dotenvy::dotenv();

        // Debug: Print all MEMOS_ env vars
        for (key, val) in env::vars() {
            if key.starts_with("MEMOS_") {
                println!("Debug Env: {} = {}", key, val);
            }
        }

        // 1. Try Environment Variables
        let env_url = env::var("MEMOS_URL");
        let env_token = env::var("MEMOS_TOKEN");

        if let (Ok(url), Ok(token)) = (env_url.clone(), env_token.clone()) {
            return Ok(MemosConfig { url, token });
        }

        // 2. Try Config File
        if let Some(config_path) = Self::get_config_path() {
            if let Ok(content) = fs::read_to_string(&config_path) {
                match serde_json::from_str::<MemosConfig>(&content) {
                    Ok(config) => return Ok(config),
                    Err(e) => println!("Failed to parse config file at {:?}: {}", config_path, e),
                }
            }
        }

        // Construct detailed error message
        let mut error_msg = String::from("Configuration not found.\n");
        error_msg.push_str("Checked Environment Variables:\n");
        error_msg.push_str(&format!(
            "  MEMOS_URL: {}\n",
            match env_url {
                Ok(_) => "Set",
                Err(_) => "Missing",
            }
        ));
        error_msg.push_str(&format!(
            "  MEMOS_TOKEN: {}\n",
            match env_token {
                Ok(_) => "Set",
                Err(_) => "Missing",
            }
        ));

        error_msg.push_str("Checked Config File:\n");
        if let Some(path) = Self::get_config_path() {
            error_msg.push_str(&format!("  Path: {:?} (Exists: {})\n", path, path.exists()));
        } else {
            error_msg.push_str("  Path: Could not determine %USERPROFILE%\n");
        }

        Err(error_msg)
    }

    fn get_config_path() -> Option<PathBuf> {
        // Check %USERPROFILE%/.hurry/config.json
        if let Ok(user_profile) = env::var("USERPROFILE") {
            let mut path = PathBuf::from(user_profile);
            path.push(".hurry");
            path.push("config.json");
            return Some(path);
        }
        None
    }
}

pub async fn post_memo(content: String) -> Result<(), String> {
    let config = MemosConfig::load().map_err(|e| e)?;

    let client = reqwest::Client::new();
    let url = format!("{}/api/v1/memos", config.url.trim_end_matches('/'));

    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", config.token))
        .json(&serde_json::json!({
            "content": content
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if response.status().is_success() {
        Ok(())
    } else {
        Err(format!("Failed to post memo: {}", response.status()))
    }
}
