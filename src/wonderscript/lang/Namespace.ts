export class Namespace {
    readonly name: string
    readonly module: object

    constructor(name: string, module: object) {
        this.name = name
        this.module = module
        globalThis[name] = this.module
    }

    toString() {
        return `#<Namespace ${this.name}>`
    }
}

export function isNamespace(x): x is Namespace {
    return x instanceof Namespace
}

export function createNs(name: string, module: object): Namespace {
    return new Namespace(name, module);
}
