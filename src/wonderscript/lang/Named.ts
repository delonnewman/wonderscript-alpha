import {Nil} from "./Nil";

export interface Named {
    name(): string
    namespace(): string | Nil
    hasNamespace(): boolean
}

export const namedHash = (name: string, namespace?: string): string => {
    if (namespace && name) {
        return `${namespace}/${name}`
    }

    return name;
}