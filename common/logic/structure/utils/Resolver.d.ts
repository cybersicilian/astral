type GenericFunc<Type> = (...args: any[]) => Type;
export type Resolver<Type> = Type | GenericFunc<Type>;
export declare class ResolverCallback<Signature extends GenericFunc<ReturnType<Signature>>> {
    private readonly callback;
    private readonly cachedValue;
    private readonly value;
    constructor(callback: Resolver<ReturnType<Signature>>);
    resolve(...args: any[]): ReturnType<Signature>;
    getCallback(): Signature;
}
export {};
