chrome.runtime.onInstalled.addListener(() => {
    const defaultValues = {
        blurMensagensEnabled: false,
        blurEntradaEnabled: false,
        blurChatsEnabled: false
    };

    chrome.storage.local.get(Object.keys(defaultValues), (storedValues) => {
        const allBlurOptionsSet = Object.keys(defaultValues).every(key => storedValues[key] !== undefined);

        if (allBlurOptionsSet) {
            console.log("As opções de blur já estão preenchidas. A extensão já foi instalada.");
            return; 
        }

        for (const key in defaultValues) {
            if (storedValues[key] === undefined) {
                storedValues[key] = defaultValues[key];
            }
        }

        chrome.storage.local.set(storedValues, () => {
            console.log("Storage initialized with default values.");
            chrome.tabs.create({ url: "https://web.whatsapp.com" }, (tab) => {
                chrome.tabs.create({ url: "https://pwwextensao.vercel.app/welcome.html" });
            });
        });
    });
});
