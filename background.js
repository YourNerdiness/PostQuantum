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

    if ((info.menuItemId == "0" || info.menuItemId  == "1") && (info.menuItemId == "0" && info.editable)) {

        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {

            chrome.tabs.sendMessage(tabs[0].id, { messageID : 0, encrypt : info.menuItemId == "0", text : info.selectionText }, () => {});

        });

    }

});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.messageID != 1) {

        return;

    }

    if (request.createNewKey) {

        const setReq = {};

        setReq["postQuantumKey-" + request.keyName] = request.key;

        chrome.storage.session.set(setReq);

        sendResponse({ ok : true }); 

    }

    else {

        chrome.storage.session.get(["postQuantumKey-" + request.keyName]).then((response) => {

            console.log(response);

            sendResponse({ response });

        });

        return true;

    }

});