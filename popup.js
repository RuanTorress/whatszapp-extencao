// ...existing code...
const settings_toggles = {
    'view_once_media': {
        title: 'Visualizar mídia mais de uma vez',
        desc: 'Permite ver mídias de "ver uma vez" várias vezes.'
    },
    'keep_revoked_messages': {
        title: 'Manter mensagens apagadas',
        desc: 'Exibe mensagens que foram apagadas pelo remetente.'
    },
    'keep_edited_messages': {
        title: 'Manter mensagens editadas',
        desc: 'Mostra o conteúdo original e editado das mensagens.'
    },
    'indicate_sender_os': {
        title: 'Indicar sistema operacional',
        desc: 'Exibe ícone do sistema operacional do remetente.'
    },
    'special_tags': {
        title: 'Tags especiais (@everyone/@admins)',
        desc: 'Permite marcar todos ou apenas administradores em grupos.'
    },
    'blue_ticks': {
        title: 'Ver ticks azuis sem enviar',
        desc: 'Permite ver confirmação de leitura sem enviar ticks azuis.'
    },
    'fullscreen': {
        title: 'Modo tela cheia',
        desc: 'Ativa o modo tela cheia no WhatsApp Web.'
    }
};

let active_settings = Object.fromEntries(Object.keys(settings_toggles).map(key => [key, true]));

const on_toggle = async (event) => {
    active_settings[event.target.id] = event.target.checked;
    chrome.storage.sync.set({settings: active_settings});
};

const add_setting_toggle = (setting_key, obj) => {
    const item = document.createElement('div');
    item.setAttribute('class', 'setting-item');

    const label = document.createElement('label');
    label.setAttribute('for', setting_key);
    label.textContent = obj.title;
    label.title = obj.desc; // tooltip
    item.appendChild(label);

    const toggle_switch = document.createElement('div');
    toggle_switch.setAttribute('class', 'toggle-switch');

    const input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('id', setting_key);
    input.setAttribute('title', obj.desc); // tooltip
    input.addEventListener('change', on_toggle);
    input.checked = active_settings[setting_key];
    toggle_switch.appendChild(input);

    const toggle_label = document.createElement('label');
    toggle_label.setAttribute('for', setting_key);
    toggle_label.setAttribute('class', 'switch-label');
    toggle_label.setAttribute('title', obj.desc); // tooltip
    toggle_switch.appendChild(toggle_label);

    item.appendChild(toggle_switch);
    return item;
};



// --- Agendamento de Mensagens ---
const scheduleForm = document.getElementById('scheduleForm');
const agendamentosDiv = document.getElementById('agendamentos');

function renderAgendamentos(agendamentos) {
    agendamentosDiv.innerHTML = '';
    if (!agendamentos || agendamentos.length === 0) {
        agendamentosDiv.innerHTML = '<p style="color:#888">Nenhum agendamento.</p>';
        return;
    }
    agendamentos.forEach((ag, idx) => {
        const item = document.createElement('div');
        item.className = 'agendamento-item';
        item.innerHTML = `<b>${ag.destinatario}</b> - ${ag.mensagem}<br><span style='font-size:13px;color:#555'>${ag.data} ${ag.hora}</span> <button data-idx='${idx}' style='margin-left:8px;color:#fff;background:#dc3545;border:none;border-radius:4px;padding:2px 8px;cursor:pointer;'>Remover</button>`;
        agendamentosDiv.appendChild(item);
    });
    // Remover agendamento
    agendamentosDiv.querySelectorAll('button').forEach(btn => {
        btn.onclick = function() {
            chrome.storage.sync.get('agendamentos').then(data => {
                let ags = data.agendamentos || [];
                ags.splice(parseInt(btn.dataset.idx), 1);
                chrome.storage.sync.set({agendamentos: ags}, () => renderAgendamentos(ags));
            });
        };
    });
}

chrome.storage.sync.get('agendamentos').then(data => {
    renderAgendamentos(data.agendamentos || []);
});

if (scheduleForm) {
    scheduleForm.onsubmit = function(e) {
        e.preventDefault();
        const destinatario = scheduleForm.destinatario.value.trim();
        const mensagem = scheduleForm.mensagem.value.trim();
        const data = scheduleForm.data.value;
        const hora = scheduleForm.hora.value;
        if (!destinatario || !mensagem || !data || !hora) return;
        chrome.storage.sync.get('agendamentos').then(store => {
            let ags = store.agendamentos || [];
            ags.push({ destinatario, mensagem, data, hora });
            chrome.storage.sync.set({agendamentos: ags}, () => {
                renderAgendamentos(ags);
                scheduleForm.reset();
            });
        });
    };
}

// --- Configurações ---
const settings_section = document.getElementById('settings_section');
chrome.storage.sync.get('settings').then(data => {
    active_settings = data.settings;
    for (const [setting_key, obj] of Object.entries(settings_toggles)) {
        const item = add_setting_toggle(setting_key, obj);
        settings_section.appendChild(item);
    }
});
