import {macroexpand} from "./macroexpand";
import {Form, isKeyword, isSymbol} from "./core";
import {emitKeyword} from "./emit/emitKeyword";
import {isArray, isBoolean, isMap, isNull, isNumber, isUndefined, str} from "../lang/runtime";
import {
    AGET_SYM, ALENGTH_SYM,
    AND_SYM,
    ASET_SYM,
    BIT_AND_SYM,
    BIT_LSHIFT_SYM,
    BIT_NOT_SYM,
    BIT_OR_SYM,
    BIT_RSHIFT_SYM,
    BIT_URSHIFT_SYM,
    BIT_XOR_SYM,
    COND_SYM,
    DEF_SYM,
    DIV_SYM,
    DO_SYM,
    DOT_SYM,
    EMPTY_ARRAY,
    EQUIV_SYM,
    FALSE_SYM,
    FN_SYM,
    GT_SYM,
    GTQ_SYM,
    IDENTICAL_SYM,
    INSTANCE_SYM,
    JS_SYM,
    LET_SYM,
    LOOP_SYM,
    LT_SYM,
    LTQ_SYM,
    MINUS_SYM,
    MOD_SYM,
    MULT_SYM,
    NEW_SYM,
    NOT_SYM,
    NULL_SYM,
    OR_SYM,
    PLUS_SYM,
    QUOTE_SYM,
    RECUR_SYM,
    SET_SYM,
    THROW_SYM,
    TRUE_SYM,
    TRY_SYM,
    TYPE_SYM,
    UNDEFINED_SYM
} from "./constants";
import {emitMap} from "./emit/emitMap";
import {RECUR_ERROR_MSG} from "./errorMessages";
import {emitSymbol} from "./emit/emitSymbol";
import {emitDef} from "./emit/emitDef";
import {emitQuote} from "./emit/emitQuote";
import {emitCond} from "./emit/emitCond";
import {emitLoop} from "./emit/emitLoop";
import {emitThrownException} from "./emit/emitThrownException";
import {emitArrayLength} from "./emit/emitArrayLength";
import {emitArrayMutation} from "./emit/emitArrayMutation";
import {emitArrayAccess} from "./emit/emitArrayAccess";
import {emitFunc} from "./emit/emitFunc";
import {emitDo} from "./emit/emitDo";
import {emitLet} from "./emit/emitLet";
import {emitObjectRes} from "./emit/emitObjectRes";
import {emitClassInit} from "./emit/emitClassInit";
import {emitAssignment} from "./emit/emitAssignment";
import {emitBinOperator} from "./emit/emitBinOperator";
import {emitFuncApplication} from "./emit/emitFuncApplication";
import {Env} from "./Env";
import {emitJS} from "./emit/emitJS";

export function emit(form_: Form, env_: Env) {
    const form = macroexpand(form_, env_);
    if (isKeyword(form)) {
        return emitKeyword(form);
    }
    else if (isSymbol(form)) {
        return emitSymbol(form, env_);
    }
    else if (isNumber(form)) {
        return str(form);
    }
    else if (isBoolean(form)) {
        return form === true ? TRUE_SYM : FALSE_SYM;
    }
    else if (isNull(form)) {
        return NULL_SYM;
    }
    else if (isUndefined(form)) {
        return UNDEFINED_SYM;
    }
    else if (isMap(form)) {
        return emitMap(form, env_);
    }
    else if (isArray(form)) {
        if (form.length === 0) {
            return EMPTY_ARRAY;
        }
        else if (isSymbol(form[0])) {
            switch(form[0]) {
                case DEF_SYM:
                    return emitDef(form, env_);
                case QUOTE_SYM:
                    return emitQuote(form);
                case COND_SYM:
                    return emitCond(form, env_);
                case JS_SYM:
                    return emitJS(form);
                case FN_SYM:
                    return emitFunc(form, env_);
                case LOOP_SYM:
                    return emitLoop(form, env_);
                case RECUR_SYM:
                    throw new Error(RECUR_ERROR_MSG);
                case THROW_SYM:
                    return emitThrownException(form, env_);
                case TRY_SYM:
                    throw new Error("not implemented");
                case DO_SYM:
                    return emitDo(form, env_);
                case LET_SYM:
                    return emitLet(form, env_);
                case DOT_SYM:
                    return emitObjectRes(form, env_);
                case NEW_SYM:
                    return emitClassInit(form, env_);
                case SET_SYM:
                    return emitAssignment(form, env_);
                // operators
                case MOD_SYM:
                    return str('(', emit(form[1], env_), '%', emit(form[2], env_), ')');
                case LT_SYM:
                    return str('(', emit(form[1], env_), '<', emit(form[2], env_), ')');
                case GT_SYM:
                    return str('(', emit(form[1], env_), '>', emit(form[2], env_), ')');
                case LTQ_SYM:
                    return str('(', emit(form[1], env_), '<=', emit(form[2], env_), ')');
                case GTQ_SYM:
                    return str('(', emit(form[1], env_), '>=', emit(form[2], env_), ')');
                case NOT_SYM:
                    return str('!(', emit(form[1], env_), ')');
                case OR_SYM:
                    return emitBinOperator(['||'].concat(form.slice(1)), env_);
                case AND_SYM:
                    return emitBinOperator(['&&'].concat(form.slice(1)), env_);
                case BIT_NOT_SYM:
                    return str('~(', emit(form[1], env_), ')');
                case BIT_OR_SYM:
                    return emitBinOperator(['|'].concat(form.slice(1)), env_);
                case BIT_XOR_SYM:
                    return emitBinOperator(['^'].concat(form.slice(1)), env_);
                case BIT_AND_SYM:
                    return emitBinOperator(['&'].concat(form.slice(1)), env_);
                case BIT_LSHIFT_SYM:
                    return emitBinOperator(['<<'].concat(form.slice(1)), env_);
                case BIT_RSHIFT_SYM:
                    return emitBinOperator(['>>'].concat(form.slice(1)), env_);
                case BIT_URSHIFT_SYM:
                    return emitBinOperator(['>>>'].concat(form.slice(1)), env_);
                case IDENTICAL_SYM:
                    return emitBinOperator(['==='].concat(form.slice(1)), env_);
                case EQUIV_SYM:
                    return emitBinOperator(['=='].concat(form.slice(1)), env_);
                case INSTANCE_SYM:
                    return emitBinOperator([' instanceof '].concat(form.slice(1)), env_);
                case TYPE_SYM:
                    return str('typeof(', emit(form[1], env_), ')');
                case PLUS_SYM:
                case MINUS_SYM:
                case DIV_SYM:
                case MULT_SYM:
                    return emitBinOperator(form, env_);
                case AGET_SYM:
                    return emitArrayAccess(form, env_);
                case ASET_SYM:
                    return emitArrayMutation(form, env_);
                case ALENGTH_SYM:
                    return emitArrayLength(form, env_);
                default:
                    return emitFuncApplication(form, env_);
            }
        }
        else {
            return emitFuncApplication(form, env_);
        }
    }
    else {
        throw new Error("Invalid form: " + form);
    }
}
