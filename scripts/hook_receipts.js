
class HookReceipts extends Hook {
    constructor() {
        super();
        this.original_delete_function = null;
    }

    register() {
        if (this.is_registered) {
            return;
        }
        super.register();

        // Intercepta o método de remoção de mensagens
        if (window.Store && window.Store.Msg && window.Store.Msg.remove) {
            this.original_delete_function = window.Store.Msg.remove;
            const original_delete = this.original_delete_function;

            window.Store.Msg.remove = function (msg) {
                // Bloqueia remoção se for "revogada" (apagada para todos)
                if (msg && msg.isRevoked) {
                    // Apenas loga, não remove
                    console.info('[WhatsApp-Web-Plus] Bloqueada remoção de mensagem apagada:', msg);
                    return false;
                }
                // Permite remoção normal para outras mensagens
                return original_delete.apply(this, arguments);
            };
        }
    }

    unregister() {
        if (!this.is_registered) {
            return;
        }
        super.unregister();
        if (window.Store && window.Store.Msg && this.original_delete_function) {
            window.Store.Msg.remove = this.original_delete_function;
        }
    }
}
