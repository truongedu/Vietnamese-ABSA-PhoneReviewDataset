// Lắng nghe sự kiện khi người dùng nhấp vào biểu tượng extension
chrome.action.onClicked.addListener((tab) => {
  // Chạy script 'content.js' trên tab hiện tại
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });
});