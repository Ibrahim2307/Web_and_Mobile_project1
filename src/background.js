chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractLinkedInData") {
    chrome.scripting.executeScript(
      {
        target: { tabId: sender.tab.id },
        files: ["./linkedinExtractor.js"],
      },
      () => {
        sendResponse({ success: true });
      }
    );
    return true;
  }
});
