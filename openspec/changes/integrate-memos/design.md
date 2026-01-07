## Context
The application is a Tauri app. The user wants to integrate with the Memos API.
Configuration needs to be read from `%USERPROFILE%` or environment variables.

## Decisions
- **Decision**: Perform Memos API requests from the Rust backend.
  - **Rationale**: 
    1. Parsing `%USERPROFILE%` and reading files is more robust and secure from the backend.
    2. Avoids Potential CORS issues if the Memos server is not configured to allow requests from the app's origin.
    3. Keeps API tokens out of the frontend state if possible (though they might be passed securely if needed, backend-only is safer).

- **Decision**: Configuration Priority
  - **Rationale**: Check Environment Variables first, then a specific config file in `%USERPROFILE%/.hurry/memos_config.json` (or similar).

- **Decision**: Config File Format
  - **Rationale**: The config file in `%USERPROFILE%/.hurry/config.json` will be in JSON format, as it is standard and easy to parse in Rust.
