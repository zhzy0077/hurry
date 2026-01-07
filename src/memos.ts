import { invoke } from "@tauri-apps/api/core";

let memoInputEl: HTMLTextAreaElement | null;
let statusMsgEl: HTMLElement | null;
let submitBtn: HTMLButtonElement | null;

async function postMemo() {
  if (memoInputEl && statusMsgEl && submitBtn) {
    const content = memoInputEl.value.trim();
    if (!content) return;

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving...";
      statusMsgEl.textContent = "";
      statusMsgEl.className = "";

      await invoke("post_memo", { content });
      
      statusMsgEl.textContent = "Memo saved successfully!";
      statusMsgEl.className = "success";
      memoInputEl.value = "";
    } catch (error) {
      statusMsgEl.textContent = `Error: ${error}`;
      statusMsgEl.className = "error";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Memo";
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  memoInputEl = document.querySelector("#memo-input");
  statusMsgEl = document.querySelector("#status-msg");
  submitBtn = document.querySelector("#submit-btn");

  document.querySelector("#memos-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    postMemo();
  });
});
