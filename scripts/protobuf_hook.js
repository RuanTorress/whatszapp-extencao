class ProtobufHook extends Hook {
    constructor() {
        super();
        this.original_function = null;
    }

    register() {
        if (this.is_registered) {
            return;
        }
        super.register();
        if (MODULES.PROTOBUF_HOOK && MODULES.PROTOBUF_HOOK.decodeProtobuf) {
            this.original_function = MODULES.PROTOBUF_HOOK.decodeProtobuf;
            const original_function = MODULES.PROTOBUF_HOOK.decodeProtobuf;
            MODULES.PROTOBUF_HOOK.decodeProtobuf = function () {
                let message = original_function(...arguments);
                return set_key_json_recursive(message, 'viewOnce', false);
            };
        } else {
            console.error("PROTOBUF_HOOK.decodeProtobuf não encontrado!");
        }
    }

    unregister() {
        if (!this.is_registered) {
            return;
        }
        super.unregister();
        MODULES.PROTOBUF_HOOK.decodeProtobuf = this.original_function;
    }
}
