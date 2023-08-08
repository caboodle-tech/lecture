class DomReady {

    #callbacks = [];

    #ready = false;

    constructor() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.#runCallbacks.bind(this));
            return;
        }
        this.#ready = true;
    }

    #runCallbacks() {
        this.#ready = true;
        this.#callbacks.forEach((func) => {
            func();
        });
        this.#callbacks = [];
    }

    whenReady(callback, scope = null) {
        if (this.#ready) {
            if (!scope) {
                callback();
            }
            callback.apply(scope);
            return;
        }
        if (!scope) {
            this.#callbacks.push(callback);
        }
        this.#callbacks.push(callback.bind(scope));
    }

}

export default new DomReady();
