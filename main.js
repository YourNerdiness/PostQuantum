const encrypt = async (plaintext, key) => {

    if (plaintext.length > key.length/8) {

        throw "Plaintext length is greater than key length, this intruduces weakeness into the cipher. Please try a shorter length of text."

    }

    else {

        const result = await chrome.storage.local.get(["postQuantumKeyIndex"])

        let keyIndex = result.postQuantumKeyIndex;

        if (keyIndex === undefined) {

            keyIndex = 0;


        }

        let ciphertext = keyIndex + ";";

        for (let i = 0; i < plaintext.length; i++) {

            const charCode = plaintext[i].charCodeAt(0);

            const usedKeyLength = 8;

            if (keyIndex + usedKeyLength*2 >= key.length) {

                throw "Key has expired, please change key.";

            }

            else {

                let encryptedCharCode = charCode ^ parseInt(key.substring(keyIndex, keyIndex + usedKeyLength), 16);

                keyIndex += usedKeyLength;

                encryptedCharCode = encryptedCharCode ^ parseInt(key.substring(keyIndex, keyIndex + usedKeyLength), 16);

                keyIndex += usedKeyLength;

                ciphertext += encryptedCharCode.toString(16) + (i == plaintext.length - 1 ? "" : ",");

            }
                

        }
        
        await chrome.storage.local.set({ postQuantumKeyIndex : keyIndex });

        return ciphertext;

    }

}

const decrypt = (ciphertextRaw, key) => {

    const ciphertextData = ciphertextRaw.split(";");

    let keyIndex = parseInt(ciphertextData[0], 10);

    const ciphertext = ciphertextData[1].split(",");

    let plaintext = "";

    for (let i = 0; i < ciphertext.length; i++) {

        const encryptedCharCode = parseInt(ciphertext[i], 16);

        const usedKeyLength = 8;

        let charCode = encryptedCharCode ^ parseInt(key.substring(keyIndex, keyIndex + usedKeyLength), 16);

        keyIndex += usedKeyLength;

        charCode = charCode ^ parseInt(key.substring(keyIndex, keyIndex + usedKeyLength), 16);

        keyIndex += usedKeyLength;

        plaintext += String.fromCharCode(charCode);

    }

    return plaintext;

};

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

        sendResponse({ ok : true });

        if (request.messageID != 0) {

            return;

        }

        let toReplace;

        chrome.runtime.sendMessage({ messageID : 1 }, async (response) => {

            const key = await response.key;

            if (key) {

                try {

                    if (request.encrypt) {
        
                        toReplace = await encrypt(request.text, key);
            
                    }
            
                    else {
            
                        toReplace = decrypt(request.text, key);
            
                    }
        
                }
        
                catch (error) {
        
                    alert(error);
        
                    return;
        
                }
        
                const range = document.getSelection().getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(toReplace));

            }

        });

        

    }

);