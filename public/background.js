// console.log("11111background.js public")

// 在 background.js 或 popup.js 中

// 默认打开侧边栏
chrome.sidePanel
.setPanelBehavior({ openPanelOnActionClick: true })
.catch((error) => console.error(error))

//在扩展安装后重新加载当前窗口中的所有标签页
chrome.runtime.onInstalled.addListener(async ({reason}) => {
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
        tabs.forEach(function(tab) {
            chrome.tabs.reload(tab.id)
        });
      });
  });


  
  // chrome.webRequest.onCompleted.addListener(
  //   function(details) {
  //     console.log('Reques111t qqqqqqqqURL:', details.url);
  //     console.log('Response:', details);
  //   },
  //   { urls: ["<all_urls>"] }
  // );
