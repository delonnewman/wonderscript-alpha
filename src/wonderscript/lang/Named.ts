import {Nil} from "./Nil";

export interface Named {
    name(): string
    namespace(): string | Nil
}