class BlueTicksHook extends Hook {
    constructor() {
        super();
        this.original_sendAck = null;
        this.original_sendMsgAck = null;
    }

    register() {
        if (this.is_registered) {
            return;
        }
        super.register();

        const webAck = MODULES.WEB_ACK;
        if (!webAck) return;

        if (typeof webAck.sendAck === 'function') {
            this.original_sendAck = webAck.sendAck;
            const original = this.original_sendAck;
            webAck.sendAck = function () {
                try {
                    const args = Array.from(arguments);
                    const isReadOrPlayed = args.some(a =>
                        a === 'read' || a === 'played' || a === 3 || a === 5 ||
                        (a && typeof a === 'object' && (a.type === 'read' || a.ack === 'read' || a.category === 'read' || a.type === 'played'))
                    );
                    if (isReadOrPlayed) {
                        console.info('[WhatsApp-Web-Plus] Bloqueado envio de recibo (read/played).', args);
                        return Promise.resolve(false);
                    }
                } catch (e) { /* ignore */ }
                return original.apply(this, arguments);
            };
        }

        if (typeof webAck.sendMsgAck === 'function') {
            this.original_sendMsgAck = webAck.sendMsgAck;
            const original2 = this.original_sendMsgAck;
            webAck.sendMsgAck = function () {
                try {
                    const args = Array.from(arguments);
                    const isReadOrPlayed = args.some(a =>
                        a === 'read' || a === 'played' || a === 3 || a === 5 ||
                        (a && typeof a === 'object' && (a.type === 'read' || a.ack === 'read' || a.category === 'read' || a.type === 'played'))
                    );
                    if (isReadOrPlayed) {
                        console.info('[WhatsApp-Web-Plus] Bloqueado envio de recibo (read/played) [sendMsgAck].', args);
                        return Promise.resolve(false);
                    }
                } catch (e) { /* ignore */ }
                return original2.apply(this, arguments);
            };
        }
    }

    unregister() {
        if (!this.is_registered) return;
        super.unregister();
        if (this.original_sendAck && MODULES.WEB_ACK) {
            MODULES.WEB_ACK.sendAck = this.original_sendAck;
        }
        if (this.original_sendMsgAck && MODULES.WEB_ACK) {
            MODULES.WEB_ACK.sendMsgAck = this.original_sendMsgAck;
        }
        this.original_sendAck = null;
        this.original_sendMsgAck = null;
    }

}
