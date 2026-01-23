import { Symbol } from "./Symbol";

export class Alien extends Symbol {
    readonly #object: Object;

    constructor(object: Object, name: string, namespace?: string) {
        super(name, namespace);
        this.#object = object;
    }

    get dispatch() {
        // return DyanmicJSDispatch instance
    }
}
