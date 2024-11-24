chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractLinkedInData") {
    chrome.scripting.executeScript(
      {
        target: { tabId: request.tab.id },
        files: ["./linkedinExtractor.js"],
      },
      () => {
        sendResponse({ success: true });
      }
    );
    return true;
  }
});
