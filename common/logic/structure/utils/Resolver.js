export class ResolverCallback {
    callback;
    cachedValue;
    value = false;
    constructor(callback) {
        this.callback = callback;
        if (typeof callback !== 'function') {
            this.value = true;
            this.cachedValue = callback;
        }
    }
    resolve(...args) {
        if (this.value) {
            return this.cachedValue;
        }
        return this.callback(...args);
    }
    getCallback() {
        return this.callback;
    }
}
