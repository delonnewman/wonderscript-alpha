import {Nil} from "./Nil";

export interface Named<Name = string> {
    name(): Name
    namespace(): string | Nil
    hasNamespace(): boolean
}

export function namedHash<Name extends string = string>(name: Name, namespace?: string): string {
    if (namespace && name) {
        return `${namespace}/${name}`
    }

    return name;
}