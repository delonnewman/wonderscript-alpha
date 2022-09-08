import {Nil} from "./Nil";

export interface Named<Name = string, Namespace = string> {
    name(): Name
    namespace(): Namespace | Nil
    hasNamespace(): boolean
}

export const namedHash = (name: string, namespace?: string): string => {
    if (namespace && name) {
        return `${namespace}/${name}`
    }

    return name;
}