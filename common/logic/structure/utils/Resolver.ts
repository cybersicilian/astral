type GenericFunc<Type> = (...args: any[]) => Type;

export type Resolver<Type> = Type|GenericFunc<Type>;

export class ResolverCallback<Signature extends GenericFunc<ReturnType<Signature>>> {
    private readonly callback: Signature;
    private readonly cachedValue: ReturnType<Signature>
    private readonly value: boolean = false;

    constructor(callback: Resolver<ReturnType<Signature>>) {
        this.callback = callback as Signature;
        if (typeof callback !== 'function') {
            this.value = true
            this.cachedValue = callback
        }
    }

    resolve(...args: any[]): ReturnType<Signature> {
        if (this.value) {
            return this.cachedValue
        }
        return this.callback(...args)
    }

    getCallback() {
        return this.callback;
    }
}