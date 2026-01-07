
// Tab Switching Logic
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = (tab as HTMLElement).dataset.tab;

      // Toggle Tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Toggle Content
      contents.forEach(c => {
        c.classList.remove('active');
        if (c.id === `${target}-view`) {
          c.classList.add('active');
        }
      });
    });
  });
}

// Global Shortcuts or app-wide init could go here
window.addEventListener("DOMContentLoaded", () => {
  initTabs();
});
