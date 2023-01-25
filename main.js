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

            if (keyIndex + usedKeyLength >= key.length) {

                throw "Key has expired, please change key.";

            }

            else {

                const encryptedCharCode = charCode ^ parseInt(key.substring(keyIndex, keyIndex + usedKeyLength), 16);

                ciphertext += encryptedCharCode.toString(16) + (i == plaintext.length - 1 ? "" : ",");

                keyIndex += usedKeyLength;

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

        const charCode = encryptedCharCode ^ parseInt(key.substring(keyIndex, keyIndex + usedKeyLength), 16);

        plaintext += String.fromCharCode(charCode);

        keyIndex += usedKeyLength

    }

    return plaintext;

};

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

        sendResponse({ ok : true });

        let toReplace;

        try {

            if (request.encrypt) {

                toReplace = await encrypt(request.text, "a1a1a1a1a1a1a1a1a1a11a1aa1aa1a1a1a1a1a1a1a1");
    
            }
    
            else {
    
                toReplace = decrypt(request.text, "a1a1a1a1a1a1a1a1a1a11a1aa1aa1a1a1a1a1a1a1a1");
    
            }

        }

        catch (error) {

            console.log(error);

            alert(error);

            return;

        }

        chrome.runtime.sendMessage({message: "write_to_file", key: "3u48832u4"}, function(response) {
            alert(response.message);
          });

        const range = document.getSelection().getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(toReplace));

    }

);