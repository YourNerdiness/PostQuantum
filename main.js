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

        const key = await chrome.storage.local.get(["postQuantumKey"])

        try {

            if (request.encrypt) {

                toReplace = await encrypt(request.text, "36097146a067415c7e54b4933f66c523737894208aa3c32aaf58d3e5abba8c564cd38f2066173166538b8b41cdb38671d6e38c807c2db8948efb58222cd0aec02f152bbf5c5eb8e54efdea858a5bde9f429d2631b015d0782880bedf028800bb1a399cd3c543b0a6f755f5c6b8f386d6348334011ca6f97fbef303b8de4c0fa09cc765ebc434e71c99288690dfb2a7d1246f57a877d039973c02124646e65f4b2d7928bbab42382ad7334858cf645d7cf0620587598f7788e65e10a95ff086233e565616121563e1c554d78995221c3cba96ff4a33a825c42d1057519f9a5fe9ae0ed6faadf38cabbce03ef10271641fd8c5fec91296b080fb5392ea9ffdb5f2c2f13a1905de12beaac0989f642b12a22e90308d27c10d41c47f079f1ea524068667343f967fc903ce37f3dce8286d63d27307a153b80dde6d4657bdc71fed4cf633132cbce3247ff68375a48b81915c243af1cb5d92e0bc0202596bebaf8e551fc85bed381f3f6ffbda7bd84687d249671402db50abc52ee1c2a2baf03d68092439dcb378ee9d2347aa64665f3864ac5aee5fa1354aa78253cfd40f54075375f770973621660d4f72eec00cd34b282c923d0557b4025ce38f80ef79e8e57ff337bb8fc244b4d7ed03451bb0a9efe5a354df93c1d4451dadad3324ef8197fabf5b55e1b25c3b44961e0947b772502a3d4a355a6963cbcf563f4e248ec562f72c75fb471725621070f7231253632f08f64adb6f748117ad896bf4ccfd30daa94829c6da750ee357ef99350f1864dad0c0c5e431a89c3463de2c5ed146f56e4a36d56c7f9ed5e710b5922d6f50143d7729aa38aeffd02e505b676486b85d7b8f47b8d8503e54ded1a930cf28eadf554438f41bb44fec705b95d77f9b5595f3ea011945a497a72d6d9d8f86bace624746f58eed925c0f1f1ca3f2387e1907775f62a883a61fb198d315a8aff6e6bbcfcf36355b11f64126ea7ac49cc8ac9308bc61f64aa1a89e4c33afbdef9926bae08c8001d9392bc8a1beb0e84e5eeba987b704c5c3b025bd37e1831162cb4077d6506776269ee7dd9cca4eb92e668818880c01a0a0eb4c2b8aed52e9c6eb8294326c256b40cd0a7ecd7115ec653600f0ef4db5f0fddbfaeff31a76ab7546d9466842d0e044fdbecfe8a31209b180e7fe68e1da2843ad9b51b02d2cb8bed509c410c46beb210d389dd15342cc5d0e1586e5b130a43824e88dd94f4c745c735ce65e047ea7f26d710af48999334d025ed880a463a67a793baade02227031fca6a4cca2990553382b652823fce3c48d099362657f107020c7932bad4f149a02c30be6be1814135b50be453cb982a90f2fed5b68593f50bd1a29efac92c810ee98aa8010cd96d65c8aeca18dcd25a7e3a1c364ea3b2f5aeeadc51cbd59ab550eba77ba95d320a79e26c4f99fbacacbb0fc9f9d6b15");
    
            }
    
            else {
    
                toReplace = decrypt(request.text, "36097146a067415c7e54b4933f66c523737894208aa3c32aaf58d3e5abba8c564cd38f2066173166538b8b41cdb38671d6e38c807c2db8948efb58222cd0aec02f152bbf5c5eb8e54efdea858a5bde9f429d2631b015d0782880bedf028800bb1a399cd3c543b0a6f755f5c6b8f386d6348334011ca6f97fbef303b8de4c0fa09cc765ebc434e71c99288690dfb2a7d1246f57a877d039973c02124646e65f4b2d7928bbab42382ad7334858cf645d7cf0620587598f7788e65e10a95ff086233e565616121563e1c554d78995221c3cba96ff4a33a825c42d1057519f9a5fe9ae0ed6faadf38cabbce03ef10271641fd8c5fec91296b080fb5392ea9ffdb5f2c2f13a1905de12beaac0989f642b12a22e90308d27c10d41c47f079f1ea524068667343f967fc903ce37f3dce8286d63d27307a153b80dde6d4657bdc71fed4cf633132cbce3247ff68375a48b81915c243af1cb5d92e0bc0202596bebaf8e551fc85bed381f3f6ffbda7bd84687d249671402db50abc52ee1c2a2baf03d68092439dcb378ee9d2347aa64665f3864ac5aee5fa1354aa78253cfd40f54075375f770973621660d4f72eec00cd34b282c923d0557b4025ce38f80ef79e8e57ff337bb8fc244b4d7ed03451bb0a9efe5a354df93c1d4451dadad3324ef8197fabf5b55e1b25c3b44961e0947b772502a3d4a355a6963cbcf563f4e248ec562f72c75fb471725621070f7231253632f08f64adb6f748117ad896bf4ccfd30daa94829c6da750ee357ef99350f1864dad0c0c5e431a89c3463de2c5ed146f56e4a36d56c7f9ed5e710b5922d6f50143d7729aa38aeffd02e505b676486b85d7b8f47b8d8503e54ded1a930cf28eadf554438f41bb44fec705b95d77f9b5595f3ea011945a497a72d6d9d8f86bace624746f58eed925c0f1f1ca3f2387e1907775f62a883a61fb198d315a8aff6e6bbcfcf36355b11f64126ea7ac49cc8ac9308bc61f64aa1a89e4c33afbdef9926bae08c8001d9392bc8a1beb0e84e5eeba987b704c5c3b025bd37e1831162cb4077d6506776269ee7dd9cca4eb92e668818880c01a0a0eb4c2b8aed52e9c6eb8294326c256b40cd0a7ecd7115ec653600f0ef4db5f0fddbfaeff31a76ab7546d9466842d0e044fdbecfe8a31209b180e7fe68e1da2843ad9b51b02d2cb8bed509c410c46beb210d389dd15342cc5d0e1586e5b130a43824e88dd94f4c745c735ce65e047ea7f26d710af48999334d025ed880a463a67a793baade02227031fca6a4cca2990553382b652823fce3c48d099362657f107020c7932bad4f149a02c30be6be1814135b50be453cb982a90f2fed5b68593f50bd1a29efac92c810ee98aa8010cd96d65c8aeca18dcd25a7e3a1c364ea3b2f5aeeadc51cbd59ab550eba77ba95d320a79e26c4f99fbacacbb0fc9f9d6b15");
    
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

);