# Project Context

## Purpose
"hurry" is a desktop application built with Tauri, designed to be a lightweight and fast native application using web technologies for the frontend.

## Tech Stack
- **Frontend**: Vanilla TypeScript, Vite, HTML/CSS
- **Backend**: Rust, Tauri v2
- **Build Tool**: Vite, Cargo (via Tauri CLI)

## Project Conventions

### Code Style
- **TypeScript**: Standard TypeScript with ES modules.
- **Rust**: idiomatic Rust using Tauri commands for logic.
- **Styling**: Vanilla CSS in `src/styles.css`.

### Architecture Patterns
- **Frontend/Backend Separation**: UI logic is in `src/`, system-level logic and commands are in `src-tauri/`.
- **Command Pattern**: Frontend communicates with Rust via Tauri's `invoke` handler.

### Testing Strategy
- Currently using standard Tauri template structure without extensive specific testing frameworks configured yet.

### Git Workflow
- Standard branch/merge workflow.

## Domain Context
- Cross-platform native application development using the Tauri framework.

## Important Constraints
- Requires Tauri v2 dependencies (Rust, system libraries).
- Optimized for performance and small binary size.

## External Dependencies
- `@tauri-apps/api`: Core API for frontend-backend communication.
- `@tauri-apps/plugin-opener`: Utility for opening shell commands/links.
