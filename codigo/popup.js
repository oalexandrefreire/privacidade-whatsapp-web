const STORAGE_KEYS = [
    'blurChatsEnabled',
    'blurNomesChatsEnabled',
    'blurChatsImagensEnabled',
    'blurChatsPreviaMensagemEnabled',
    'blurMensagensEnabled',
    'blurEntradaEnabled'
];

const switches = {
    chats: document.getElementById('chatsSwitch'),
    nomesChats: document.getElementById('nomesChatsSwitch'),
    chatsImagens: document.getElementById('chatsImagensSwitch'),
    chatsPreviaMensagem: document.getElementById('chatsPreviaMensagemSwitch'),
    mensagens: document.getElementById('mensagensSwitch'),
    entrada: document.getElementById('entradaTextoswitch')
};

const mensagem = document.getElementById('mensagem');
const pww = document.getElementById('pww');

function normalizeBlurStates(data = {}) {
    return {
        blurChatsEnabled: data.blurChatsEnabled ?? false,
        blurNomesChatsEnabled: data.blurNomesChatsEnabled ?? false,
        blurChatsImagensEnabled: data.blurChatsImagensEnabled ?? false,
        blurChatsPreviaMensagemEnabled: data.blurChatsPreviaMensagemEnabled ?? false,
        blurMensagensEnabled: data.blurMensagensEnabled ?? false,
        blurEntradaEnabled: data.blurEntradaEnabled ?? false
    };
}

function updateSwitches(isWhatsAppWeb, blurStates) {
    if (isWhatsAppWeb) {
        mensagem.style.display = 'none';
        pww.style.display = 'block';

        switches.chats.checked = blurStates.blurChatsEnabled;
        switches.nomesChats.checked = blurStates.blurNomesChatsEnabled;
        switches.chatsImagens.checked = blurStates.blurChatsImagensEnabled;
        switches.chatsPreviaMensagem.checked = blurStates.blurChatsPreviaMensagemEnabled;
        switches.mensagens.checked = blurStates.blurMensagensEnabled;
        switches.entrada.checked = blurStates.blurEntradaEnabled;
    } else {
        mensagem.style.display = 'block';
        pww.style.display = 'none';
    }
}

function checkIfWhatsAppWebOnPageIsLoaded(tabs) {
    const currentTab = tabs[0];
    const isWhatsAppWeb = currentTab && currentTab.url.includes('web.whatsapp.com');

    chrome.storage.local.get(STORAGE_KEYS, data => {
        updateSwitches(isWhatsAppWeb, normalizeBlurStates(data));
    });
}

chrome.tabs.query({ active: true, currentWindow: true }, checkIfWhatsAppWebOnPageIsLoaded);

function handleSwitchChange() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const currentTab = tabs[0];
        const isWhatsAppWeb = currentTab && currentTab.url.includes('web.whatsapp.com');

        if (!isWhatsAppWeb) {
            updateSwitches(false, {});
            return;
        }

        const newBlurStates = normalizeBlurStates({
            blurChatsEnabled: switches.chats.checked,
            blurNomesChatsEnabled: switches.nomesChats.checked,
            blurChatsImagensEnabled: switches.chatsImagens.checked,
            blurChatsPreviaMensagemEnabled: switches.chatsPreviaMensagem.checked,
            blurMensagensEnabled: switches.mensagens.checked,
            blurEntradaEnabled: switches.entrada.checked
        });

        chrome.storage.local.set(newBlurStates, () => {
            updateSwitches(true, newBlurStates);
            chrome.tabs.sendMessage(currentTab.id, newBlurStates);
        });
    });
}

Object.values(switches).forEach(item => {
    item.addEventListener('change', handleSwitchChange);
});
