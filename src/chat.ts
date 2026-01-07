
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { marked } from "marked";

type LlmConfig = {
    endpoint: string;
    apikey: string;
    model: string;
};

let configLoaded = false;
let isProcessing = false;

// DOM Elements
let outputEl: HTMLElement;
let promptInput: HTMLTextAreaElement;
let sendBtn: HTMLButtonElement;
let settingsModal: HTMLElement;
let settingsForm: HTMLFormElement;
let settingsBtn: HTMLElement;
let cancelSettingsBtn: HTMLElement;

// Settings Inputs
let endpointInput: HTMLInputElement;
let apikeyInput: HTMLInputElement;
let modelInput: HTMLInputElement;

// Streaming State
let currentResponseText = "";
let aiContentDiv: HTMLElement | null = null;
let unlistenToken: (() => void) | null = null;
let unlistenFinished: (() => void) | null = null;

async function loadConfig() {
    try {
        const config = await invoke<LlmConfig>("get_llm_config");
        endpointInput.value = config.endpoint;
        apikeyInput.value = config.apikey;
        modelInput.value = config.model;
        configLoaded = true;
        closeSettings();
    } catch (e) {
        console.log("Config load failed or empty:", e);
        configLoaded = false;
        openSettings();
    }
}

async function saveConfig(e: Event) {
    e.preventDefault();
    const endpoint = endpointInput.value.trim();
    const apikey = apikeyInput.value.trim();
    const model = modelInput.value.trim();

    try {
        await invoke("save_llm_config", { endpoint, apikey, model });
        configLoaded = true;
        closeSettings();
        if (!outputEl.innerHTML.includes("<strong>You:</strong>")) {
            outputEl.innerHTML = `<p style="color: #10b981; text-align: center;">Configuration saved. Ready to chat.</p>`;
        }
    } catch (err) {
        alert("Failed to save config: " + err);
    }
}

async function handleChat(e: Event) {
    e.preventDefault();
    if (!configLoaded) {
        openSettings();
        return;
    }
    if (isProcessing) return;

    const prompt = promptInput.value.trim();
    if (!prompt) return;

    startStreaming(prompt);
}

async function startStreaming(prompt: string) {
    isProcessing = true;
    sendBtn.disabled = true;
    sendBtn.textContent = "Stop";
    promptInput.value = "";
    currentResponseText = "";

    // Render User Prompt
    const userHtml = `<div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb;">
    <strong style="display:block; color: #374151; margin-bottom: 0.25rem;">You</strong>
    <div style="color: #1f2937;">${escapeHtml(prompt)}</div>
  </div>`;

    outputEl.innerHTML = userHtml + `<div id="ai-response"><strong style="display:block; color: #2563eb; margin-bottom: 0.5rem;">AI</strong><div class="markdown-body"></div></div>`;
    aiContentDiv = document.querySelector("#ai-response .markdown-body");

    // Change Button to Stop (Optional implementation, for now acting as busy indicator)

    // Setup Listeners
    if (unlistenToken) unlistenToken();
    if (unlistenFinished) unlistenFinished();

    unlistenToken = await listen<string>("llm-token", (event) => {
        currentResponseText += event.payload;
        renderMarkdown(currentResponseText);
        // Auto scroll
        window.scrollTo(0, document.body.scrollHeight);
    });

    unlistenFinished = await listen("llm-finished", () => {
        endStreaming();
    });

    try {
        await invoke("chat_completion", { prompt });
        // The command returns quickly? No, SSE loop runs in backend.
        // It returns Result<(), String>. If it errors immediately, catch here.
        // If it runs successfully, it streams events.
    } catch (err) {
        if (aiContentDiv) {
            aiContentDiv.innerHTML += `<p style="color: #ef4444;">Error: ${err}</p>`;
        }
        endStreaming();
    }
}

function endStreaming() {
    isProcessing = false;
    sendBtn.disabled = false;
    sendBtn.textContent = "Send";
    if (unlistenToken) { unlistenToken(); unlistenToken = null; }
    if (unlistenFinished) { unlistenFinished(); unlistenFinished = null; }
    promptInput.focus();
}

async function renderMarkdown(text: string) {
    if (aiContentDiv) {
        // marked.parse is async or sync depending on options, async default in newer
        const parsed = await marked.parse(text);
        aiContentDiv.innerHTML = parsed;
    }
}


function openSettings() {
    settingsModal.classList.add("visible");
}

function closeSettings() {
    settingsModal.classList.remove("visible");
}

function escapeHtml(text: string) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.addEventListener("DOMContentLoaded", () => {
    outputEl = document.getElementById("output")!;
    promptInput = document.getElementById("prompt-input") as HTMLTextAreaElement;
    sendBtn = document.getElementById("send-btn") as HTMLButtonElement;
    settingsModal = document.getElementById("settings-modal")!;
    settingsForm = document.getElementById("settings-form") as HTMLFormElement;
    settingsBtn = document.getElementById("settings-btn")!;
    cancelSettingsBtn = document.getElementById("cancel-settings")!;

    endpointInput = document.getElementById("cfg-endpoint") as HTMLInputElement;
    apikeyInput = document.getElementById("cfg-apikey") as HTMLInputElement;
    modelInput = document.getElementById("cfg-model") as HTMLInputElement;

    settingsBtn.addEventListener("click", openSettings);
    cancelSettingsBtn.addEventListener("click", closeSettings);
    settingsForm.addEventListener("submit", saveConfig);
    document.getElementById("chat-form")?.addEventListener("submit", handleChat);

    promptInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            document.getElementById("chat-form")?.dispatchEvent(new Event("submit"));
        }
    });

    loadConfig();
});
