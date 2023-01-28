const newKey = () => {

    const keyName = prompt("Please enter the name of your new key: ") + ".txt";

    let key = "";

    for (let i = 0; i < 4; i++) {

        const array = new BigUint64Array(8192);
        self.crypto.getRandomValues(array);
    
        for (const num of array) {
    
            key += num.toString(16).padStart(16, "0");
    
        }

    }

    const download = document.createElement('a');

    download.setAttribute('href', 'data:text/plain;charset=utf-8,' + key);
    download.setAttribute('download', keyName);

    download.style.display = 'none';

    document.body.appendChild(download);

    download.click();

    document.body.removeChild(download);

};

const loadKey = () => {

    const loadKeyInput = document.getElementById("loadKeyInput");

    loadKeyInput.click();

};

const loadFile = (event) => {

    const fr = new FileReader();

    fr.onload = () => {

        chrome.runtime.sendMessage({ messageID : 1, createNewKey : true, key : fr.result, keyName : event.target.files[0].name.split(".")[0] }, (response) => {});

    };

    fr.readAsText(event.target.files[0]);

}

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById("newKey").addEventListener("click", newKey);
    document.getElementById("loadKey").addEventListener("click", loadKey);
    document.getElementById("loadKeyInput").addEventListener("change", loadFile);


});