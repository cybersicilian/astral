export type AsJson<T> =
    T extends string | number | boolean | null ? T :
        T extends Function ? never :
            T extends object ? { [K in keyof T]: AsJson<T[K]> } :
                never;