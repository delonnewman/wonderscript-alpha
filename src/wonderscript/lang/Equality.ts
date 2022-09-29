import {isFunction} from "./runtime";

export interface Equality {
    equals(other): boolean
}

export const isEquality = (value: any): value is Equality => {
    if (value == null) return false;

    return isFunction(value.equals);
}
