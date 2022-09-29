import {isFunction} from "./runtime";
import {Equality, isEquality} from "./Equality";

export interface Value extends Equality {
    hashCode(): number
}

export const isValue = (value: any): value is Value => {
    if (value == null) return false;

    return isFunction(value.hashCode) && isEquality(value);
}