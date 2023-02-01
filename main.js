const encrypt = async (plaintext, key, keyName) => {

    if (plaintext.length > key.length/8 + 128) {

        throw "Key has expired, please change key.";

    }

    else {

        const result = await chrome.storage.local.get(["postQuantumKeyIndex-" + encodeURIComponent(keyName)]);

        let keyIndex = result["postQuantumKeyIndex-" + encodeURIComponent(keyName)];

        if (keyIndex === undefined) {

            keyIndex = 0;

        }

        let ciphertext = keyIndex + ";";

        for (let i = 0; i < plaintext.length; i++) {

            const charCode = plaintext[i].charCodeAt(0);

            const usedKeyLength = 8;

            if (keyIndex + usedKeyLength + 128 >= key.length) {

                throw "Key has expired, please change key.";

            }

            else {

                let encryptedCharCode = charCode ^ parseInt(key.substring(keyIndex, keyIndex + usedKeyLength), 16);

                keyIndex += usedKeyLength;

                ciphertext += encryptedCharCode.toString(16) + (i == plaintext.length - 1 ? "" : ",");

            }
                

        }

        ciphertext += ";";

        const encodedPlaintext = new TextEncoder().encode(plaintext);

        const digest = await crypto.subtle.digest("SHA-512", encodedPlaintext);

        const digestArray = Array.from(new Uint8Array(digest));

        for (let i = 0; i < digestArray.length; i++) {

            const hashNum = digestArray[i];

            const usedKeyLength = 2;

            if (keyIndex + usedKeyLength >= key.length) {

                throw "Key has expired, please change key.";

            }

            else {

                let encryptedHashNum = hashNum ^ parseInt(key.substring(keyIndex, keyIndex + usedKeyLength), 16);

                keyIndex += usedKeyLength;

                ciphertext += encryptedHashNum.toString(16) + (i == digestArray.length - 1 ? "" : ",");

            }
                

        }

        const setReq = {};

        setReq["postQuantumKeyIndex-" + encodeURIComponent(keyName)] = keyIndex;
        
        await chrome.storage.local.set(setReq);

        return ciphertext;

    }

}

const decrypt = async (ciphertextRaw, key) => {

    const ciphertextData = ciphertextRaw.split(";");

    if (ciphertextData.length != 3 || !ciphertextData[0] || !ciphertextData[1] || !ciphertextData[2]) {

        throw  "Selected text is not valid ciphertext. Make sure you have selected the entire message."

    }

    else {

        let keyIndex = parseInt(ciphertextData[0], 10);

        const ciphertext = ciphertextData[1].split(",");

        const encryptedDigest = ciphertextData[2].split(",");
    
        let plaintext = "";
    
        for (let i = 0; i < ciphertext.length; i++) {
    
            const encryptedCharCode = parseInt(ciphertext[i], 16);
    
            const usedKeyLength = 8;
    
            let charCode = encryptedCharCode ^ parseInt(key.substring(keyIndex, keyIndex + usedKeyLength), 16);
    
            keyIndex += usedKeyLength;
    
            plaintext += String.fromCharCode(charCode);
    
        }

        const encodedPlaintext = new TextEncoder().encode(plaintext);

        const digest = await crypto.subtle.digest("SHA-512", encodedPlaintext);

        const digestArray = Array.from(new Uint8Array(digest));

        for (let i = 0; i < encryptedDigest.length; i++) {

            const encryptedDigestNum = parseInt(encryptedDigest[i], 16);

            const usedKeyLength = 2;

            if (keyIndex + usedKeyLength >= key.length) {

                throw "Key has expired, please change key.";

            }

            else {

                let decryptedDigestNum = encryptedDigestNum ^ parseInt(key.substring(keyIndex, keyIndex + usedKeyLength), 16);

                keyIndex += usedKeyLength;

                if (decryptedDigestNum != digestArray[i]) {

                    throw "Your message has been tampered with.";

                };

            }   

        }

        const setReq = {};

        setReq["postQuantumKeyIndex-" + encodeURIComponent(keyName)] = keyIndex;
        
        await chrome.storage.local.set(setReq);
    
        return plaintext;

    }

};

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

        sendResponse({ ok : true });

        if (request.messageID != 0) {

            return;

        }

        const keyName = encodeURIComponent(prompt("Please enter the name of your key: "));

        chrome.runtime.sendMessage({ messageID : 1, createNewKey : false, keyName }, async (response) => {

            const key = response.response["postQuantumKey-" + keyName];

            if (key) {

                let toReplace;

                try {

                    if (request.encrypt) {
        
                        toReplace = await encrypt(request.text, key, keyName);
            
                    }
            
                    else {
            
                        toReplace = await decrypt(request.text, key, keyName);
            
                    }
        
                }
        
                catch (error) {

                    console.log(error);
        
                    alert(error);
        
                    return;
        
                }
        
                const range = document.getSelection().getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(toReplace));

            }

            else {
                
                alert("You have not loaded that key yet. Please open the extension popup to load the key.")

            }

        });

    }

);