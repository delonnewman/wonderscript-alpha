import {createNs} from "../lang/Namespace";
import {env} from "./Env";

export const CORE_MOD = {};
export const CORE_NS = createNs('wonderscript.core', CORE_MOD);
export const CURRENT_NS = {
    value: CORE_NS
};

export const TOP_LEVEL_ENV = env();
