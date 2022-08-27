import {createNs} from "../lang/Namespace";

export const CORE_MOD = {};
export const CORE_NS = createNs('wonderscript.core', CORE_MOD);
export const CURRENT_NS = {
    value: CORE_NS
};

globalThis.wonderscript ||= {};
globalThis.wonderscript.core = CORE_MOD;
