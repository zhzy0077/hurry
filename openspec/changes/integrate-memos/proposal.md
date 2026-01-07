# Change: Integrate Memos

## Why
Users need a quick way to save notes/memos to their self-hosted Memos instance directly from the application, without opening a browser.

## What Changes
- Add a new "Memos" page to the application with a minimalist, beautiful design.
- Implement backend logic to read Memos configuration (URL, Access Token) from environment variables or a user profile file.
- Implement a backend command to send the note content to the Memos API.

## Impact
- Affected specs: `web-ui`, `backend`
- Affected code: `src/`, `src-tauri/`
