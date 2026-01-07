
// View Switching Logic
function initViewSwitcher() {
  window.addEventListener("keydown", (e) => {
    // Prevent switching if Settings modal is open
    if (document.getElementById("settings-modal")?.classList.contains("visible")) {
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      toggleView();
    }
  });
}

function toggleView() {
  const chatView = document.getElementById("chat-view");
  const memosView = document.getElementById("memos-view");

  if (chatView && memosView) {
    const isChatActive = chatView.classList.contains("active");

    if (isChatActive) {
      chatView.classList.remove("active");
      memosView.classList.add("active");
      document.getElementById("memo-input")?.focus();
    } else {
      memosView.classList.remove("active");
      chatView.classList.add("active");
      document.getElementById("prompt-input")?.focus();
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  initViewSwitcher();
  initWindowEvents();
});

function initWindowEvents() {
  window.addEventListener("focus", () => {
    focusCurrentInput();
  });
}

function focusCurrentInput() {
  const chatView = document.getElementById("chat-view");
  const memosView = document.getElementById("memos-view");

  if (chatView?.classList.contains("active")) {
    document.getElementById("prompt-input")?.focus();
  } else if (memosView?.classList.contains("active")) {
    document.getElementById("memo-input")?.focus();
  }
}
