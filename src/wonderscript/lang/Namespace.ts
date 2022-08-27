export class Namespace {
    readonly name: string
    readonly module: object

    constructor(name: string, module: object) {
        this.name = name
        this.module = module
        this.defineModule()
    }

    private defineModule() {
        let mod = globalThis;
        this.name.split('.').forEach((part) => {
            if (mod[part] == null) mod[part] = {};
            mod = mod[part];
        });
        // @ts-ignore
        mod = this.module
    }

    toString() {
        return `#<Namespace ${this.name}>`;
    }
}

export function isNamespace(x): x is Namespace {
    return x instanceof Namespace;
}

export function createNs(name: string, module: object): Namespace {
    return new Namespace(name, module);
}
