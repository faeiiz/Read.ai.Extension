document.addEventListener("DOMContentLoaded", () => {
  console.log("Popup loaded!");

  document.getElementById("start").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: "startCapturing" });
    });
  });

  document.getElementById("stop").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: "stopCapturing" });
    });
  });
});
