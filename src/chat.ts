
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { marked } from "marked";

let isProcessing = false;

// DOM Elements
let outputEl: HTMLElement;
let promptInput: HTMLTextAreaElement;
let sendBtn: HTMLButtonElement;

// Streaming State
let currentResponseText = "";
let aiContentDiv: HTMLElement | null = null;
let unlistenToken: (() => void) | null = null;
let unlistenFinished: (() => void) | null = null;

async function handleChat(e: Event) {
    e.preventDefault();

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
        const parsed = await marked.parse(text);
        aiContentDiv.innerHTML = parsed;
    }
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

    document.getElementById("chat-form")?.addEventListener("submit", handleChat);

    promptInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            document.getElementById("chat-form")?.dispatchEvent(new Event("submit"));
        }
    });
});
