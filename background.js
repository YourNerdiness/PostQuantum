chrome.contextMenus.removeAll(() => {

    chrome.contextMenus.create({

        "id" : "0",
    
        "title": "Encrypt OTP",
        "contexts": ["selection"]
    
    });
    
    chrome.contextMenus.create({
    
        "id" : "1",
    
        "title": "Decrypt OTP",
        "contexts": ["selection"]
    
    });

});

chrome.contextMenus.onClicked.addListener((info) => {

    if ((info.menuItemId == "0" || info.menuItemId  == "1") && info.editable) {

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

            chrome.tabs.sendMessage(tabs[0].id, { messageID : 0, encrypt : info.menuItemId == "0", text : info.selectionText }, () => {});

        });

    }

});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

    if (request.messageID != 1) {

        return;

    } 

    const key = (await chrome.storage.session.get(["postQuantumKey"])).key;

    console.log(key)
        
    sendResponse({ key });

});