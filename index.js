function inject_script(scriptName) {
    return new Promise(function () {
        const s = document.createElement('script');
        s.src = chrome.runtime.getURL(scriptName);
        (document.head || document.documentElement).appendChild(s);
    });
}

function handle_settings_update(settings) {
    window.postMessage({'settings': settings});
}


inject_script('packed.js');


chrome.storage.sync.onChanged.addListener(function (changes) {
    if (changes?.settings !== undefined) {
        handle_settings_update(changes.settings.newValue);
    }
});


setTimeout(function () {
    chrome.storage.sync.get('settings').then((data) => {
        window.postMessage({'settings': data.settings});
    });
}, 2000);

// --- Envio automático de mensagens agendadas ---
function buscarChatPorNome(nome) {
    // Simula busca pelo nome do contato/grupo na barra de pesquisa do WhatsApp Web
    const searchBox = document.querySelector('div[role="textbox"]');
    if (!searchBox) return false;
    searchBox.focus();
    searchBox.textContent = nome;
    searchBox.dispatchEvent(new Event('input', { bubbles: true }));
    // Aguarda renderização dos resultados
    return new Promise(resolve => {
        setTimeout(() => {
            const chat = Array.from(document.querySelectorAll('div[role="gridcell"] span[title]')).find(e => e.textContent === nome);
            if (chat) {
                chat.click();
                resolve(true);
            } else {
                resolve(false);
            }
        }, 1200);
    });
}

function enviarMensagemParaChat(mensagem) {
    // Simula digitação e envio da mensagem
    const inputBox = document.querySelector('[contenteditable="true"]');
    if (!inputBox) return false;
    inputBox.focus();
    document.execCommand('insertText', false, mensagem);
    inputBox.dispatchEvent(new Event('input', { bubbles: true }));
    // Clica no botão de enviar
    const sendBtn = document.querySelector('button span[data-icon="send"]');
    if (sendBtn) {
        sendBtn.closest('button').click();
        return true;
    }
    return false;
}

function verificarAgendamentos() {
    chrome.storage.sync.get('agendamentos').then(data => {
        const ags = data.agendamentos || [];
        const agora = new Date();
        ags.forEach((ag, idx) => {
            const agData = new Date(ag.data + 'T' + ag.hora);
            if (
                agData <= agora &&
                !ag.enviado // só envia se ainda não foi enviado
            ) {
                buscarChatPorNome(ag.destinatario).then(encontrado => {
                    if (encontrado) {
                        enviarMensagemParaChat(ag.mensagem);
                        ags[idx].enviado = true;
                        chrome.storage.sync.set({ agendamentos: ags });
                    }
                });
            }
        });
    });
}

setInterval(verificarAgendamentos, 60000); // verifica a cada minuto
