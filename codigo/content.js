const STORAGE_KEYS = [
    'blurMensagensEnabled',
    'blurEntradaEnabled',
    'blurChatsEnabled',
    'blurNomesChatsEnabled',
    'blurChatsImagensEnabled',
    'blurChatsPreviaMensagemEnabled'
];

const BLUR_CLASS = 'blurred-item';
const LAYER_CLASSES = {
    mensagens: 'pww-blur-mensagens',
    entrada: 'pww-blur-entrada',
    chats: 'pww-blur-chats',
    nomesChats: 'pww-blur-nomes-chats',
    chatsImagens: 'pww-blur-chats-imagens',
    chatsPreviaMensagem: 'pww-blur-chats-previa'
};
const ALL_LAYER_CLASSES = Object.values(LAYER_CLASSES);

const DEFAULT_STATES = {
    blurMensagensEnabled: false,
    blurEntradaEnabled: false,
    blurChatsEnabled: false,
    blurNomesChatsEnabled: false,
    blurChatsImagensEnabled: false,
    blurChatsPreviaMensagemEnabled: false
};

let currentStates = { ...DEFAULT_STATES };
let scheduledApply = null;

const getElements = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const uniqueElements = (...collections) => {
    const elements = new Set();

    collections.flat().forEach(element => {
        if (element instanceof Element) {
            elements.add(element);
        }
    });

    return Array.from(elements);
};

const getChatRows = () => uniqueElements(
    getElements('[role="row"][data-testid^="list-item-"]'),
    getElements('[role="listitem"][data-testid^="list-item-"]')
);

const getConversationItems = () => uniqueElements(
    getElements('#pane-side [role="listitem"], [aria-label*="conversa" i] [role="listitem"]'),
    getChatRows()
);

const getChatContentElements = () => {
    const chatContents = [];

    getChatRows().forEach(row => {
        chatContents.push(...getElements('[data-testid="cell-frame-title"] span[dir]', row));
        chatContents.push(...getElements('[data-testid="cell-frame-primary-detail"] span', row));
        chatContents.push(...getElements('[data-testid="cell-frame-secondary"] span[dir]', row));
        chatContents.push(...getElements('[data-testid="cell-frame-secondary"] [data-testid="last-msg-status"]', row));
        chatContents.push(...getElements('img', row));
    });

    return uniqueElements(chatContents);
};

const getNomesChatsElements = () => {
    const chatContents = [];

    getChatRows().forEach(row => {
        chatContents.push(...getElements('[data-testid="cell-frame-title"] span[dir]', row));
    });

    return uniqueElements(chatContents);
};

const getChatsImagensElements = () => {
    const chatContents = [];

    getChatRows().forEach(row => {
        chatContents.push(...getElements('img', row));
    });

    return uniqueElements(chatContents);
};

const getChatsPreviaMensagemElements = () => {
    const chatContents = [];

    getChatRows().forEach(row => {
        chatContents.push(...getElements('[data-testid="cell-frame-secondary"] span[dir]', row));
        chatContents.push(...getElements('[data-testid="cell-frame-secondary"] [data-testid="last-msg-status"]', row));
    });

    return uniqueElements(chatContents);
};

const getMessageElements = () => {
    const messages = [];

    getElements('#main [data-testid^="conv-msg-"]').forEach(message => {
        const container = message.querySelector('[data-testid="msg-container"]');
        messages.push(container || message);
        messages.push(...getElements('[data-testid="addon-bubble-container"]', message));
        messages.push(...getElements('[data-testid="reaction-bubble"]', message));
    });

    uniqueElements(
        getElements('#main .message-in, #main .message-out'),
        getElements('#main [data-id^="false_"], #main [data-id^="true_"]'),
        getElements('#main [role="row"] [data-pre-plain-text]'),
        getElements('#main div._amk4 > ._amk6'),
        getElements('#main div._amk4 ._am2s'),
        getElements('#main span._amk7')
    ).forEach(element => {
        messages.push(element.closest('[data-testid^="conv-msg-"] [data-testid="msg-container"], .message-in, .message-out, [data-id]') || element);
    });

    getElements('header[data-testid="conversation-header"]').forEach(header => {
        messages.push(...getElements('[data-testid="conversation-info-header-chat-title"]', header));
        messages.push(...getElements('img', header));
    });

    return uniqueElements(messages);
};

const getInputElements = () => uniqueElements(
    getElements('#main footer [data-testid="compose-box"]'),
    getElements('#main footer [data-testid="compose-box"] button'),
    getElements('#main footer [data-testid="compose-box"] [aria-hidden="true"]'),
    getElements('#main footer [data-testid="conversation-compose-box-input"]'),
    getElements('#main footer [contenteditable="true"]'),
    getElements('#main footer [role="textbox"]'),
    getElements('div[contenteditable="true"][data-tab]')
);

const syncBlurClass = (element) => {
    const hasActiveLayer = ALL_LAYER_CLASSES.some(className => element.classList.contains(className));
    element.classList.toggle(BLUR_CLASS, hasActiveLayer);
};

const setLayerBlur = (layerClass, elements, enabled) => {
    const selectedElements = new Set(elements);
    const trackedElements = uniqueElements(
        getElements(`.${layerClass}`),
        Array.from(selectedElements)
    );

    trackedElements.forEach(element => {
        element.classList.toggle(layerClass, Boolean(enabled) && selectedElements.has(element));
        syncBlurClass(element);
    });
};

const normalizeStates = (states = {}) => ({
    blurMensagensEnabled: states.blurMensagensEnabled ?? false,
    blurEntradaEnabled: states.blurEntradaEnabled ?? false,
    blurChatsEnabled: states.blurChatsEnabled ?? false,
    blurNomesChatsEnabled: states.blurNomesChatsEnabled ?? false,
    blurChatsImagensEnabled: states.blurChatsImagensEnabled ?? false,
    blurChatsPreviaMensagemEnabled: states.blurChatsPreviaMensagemEnabled ?? false
});

const applyBlur = (states) => {
    currentStates = normalizeStates(states);

    setLayerBlur(LAYER_CLASSES.mensagens, getMessageElements(), currentStates.blurMensagensEnabled);
    setLayerBlur(LAYER_CLASSES.entrada, getInputElements(), currentStates.blurEntradaEnabled);
    setLayerBlur(LAYER_CLASSES.chats, getChatContentElements(), currentStates.blurChatsEnabled);
    setLayerBlur(LAYER_CLASSES.nomesChats, getNomesChatsElements(), currentStates.blurNomesChatsEnabled);
    setLayerBlur(LAYER_CLASSES.chatsImagens, getChatsImagensElements(), currentStates.blurChatsImagensEnabled);
    setLayerBlur(LAYER_CLASSES.chatsPreviaMensagem, getChatsPreviaMensagemElements(), currentStates.blurChatsPreviaMensagemEnabled);
};

const loadAndApplyBlur = () => {
    chrome.storage.local.get(STORAGE_KEYS, data => {
        try {
            applyBlur(data);
        } catch (error) {
            console.error('PWW: error applying blur', error);
        }
    });
};

const scheduleApplyBlur = () => {
    if (scheduledApply) {
        clearTimeout(scheduledApply);
    }

    scheduledApply = setTimeout(() => {
        scheduledApply = null;
        applyBlur(currentStates);
    }, 150);
};

loadAndApplyBlur();

const observer = new MutationObserver(scheduleApplyBlur);
observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        applyBlur(request);
        sendResponse({ status: 'success' });
    } catch (error) {
        console.error('PWW: error applying blur from message', error);
        sendResponse({ status: 'error', message: error.message });
    }
});
