chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "keepAlive") {
    console.log("Keeping service worker alive");
    sendResponse({ status: "alive" });
  }
});
