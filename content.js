console.log("Meet Captions Extractor Installed!");
let captionsInterval = null;
let lastCaptured = new Map(); // Store last sent caption per speaker

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startCapturing") {
    if (captionsInterval) {
      console.log("Captions are already being extracted.");
      return;
    }
    console.log("Starting Captions Extraction...");
    captionsInterval = setInterval(() => {
      let captions = document.querySelectorAll("div[class*='uYs2ee']");
      console.log("Captions Found:", captions);

      captions.forEach((cap) => {
        let text = cap.innerText.trim();
        if (!text) return;

        let speaker = text.split("\n")[0]; // Extract speaker name (if applicable)
        let message = text.split("\n").slice(1).join(" "); // Extract the actual caption text

        // Get last saved message from this speaker
        let lastMessage = lastCaptured.get(speaker) || "";

        if (message.startsWith(lastMessage)) {
          // Only send the new part
          let newWords = message.slice(lastMessage.length).trim();
          if (newWords) {
            console.log("New words captured:", newWords);
            sendToServer(newWords);
          }
        } else {
          // Send full message if it's completely new
          console.log("New full caption:", message);
          sendToServer(message);
        }

        // Update last captured text for the speaker
        lastCaptured.set(speaker, message);
      });

      // Optional: Keep only last 50 speakers to prevent memory leaks
      if (lastCaptured.size > 50) {
        lastCaptured = new Map([...lastCaptured.entries()].slice(-50));
      }
    }, 5000);
  }

  if (message.action === "stopCapturing") {
    if (captionsInterval) {
      clearInterval(captionsInterval);
      captionsInterval = null;
      console.log("Captions extraction stopped.");
    }
  }
});

function sendToServer(text) {
  fetch("http://localhost:8080/storecaptions", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ caption: text }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Server error: ${response.status} - ${text}`);
        });
      }
      return response.json();
    })
    .then((data) => console.log("Saved:", data))
    .catch((error) => console.error("Error:", error));
}
