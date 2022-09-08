import {macroexpand} from "./macroexpand";
import {Form} from "./core";
import {emitKeyword} from "./emit/emitKeyword";
import {isArray, isBoolean, isMap, isNull, isNumber, isString, isUndefined} from "../lang/runtime";
import {
    AGET_SYM,
    ALENGTH_SYM,
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
    JS_AND,
    JS_BIT_AND,
    JS_BIT_LSHIFT, JS_BIT_NOT,
    JS_BIT_OR,
    JS_BIT_RSHIFT,
    JS_BIT_URSHIFT,
    JS_BIT_XOR,
    JS_EQUIV,
    JS_IDENTICAL,
    JS_INSTANCE,
    JS_NOT,
    JS_OR,
    JS_SYM, JS_TYPEOF,
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
import {emitVariableOp} from "./emit/emitVariableOp";
import {emitFuncApplication} from "./emit/emitFuncApplication";
import {Env} from "./Env";
import {emitJS} from "./emit/emitJS";
import {emitUnaryOp} from "./emit/emitUnaryOp";
import {emitBinOp} from "./emit/emitBinOp";
import {isKeyword} from "../lang/Keyword";
import {isSymbol} from "../lang/Symbol";
import {prStr} from "./prStr";

export function emit(form_: Form, env_: Env) {
    const form = macroexpand(form_, env_);
    if (isKeyword(form)) {
        return emitKeyword(form);
    }
    else if (isSymbol(form)) {
        return emitSymbol(form, env_);
    }
    else if (isNumber(form) || isString(form)) {
        return JSON.stringify(form);
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
    // TODO: add support for Set
    else if (isMap(form)) {
        return emitMap(form, env_);
    }
    else if (isArray(form)) {
        if (form.length === 0) {
            return EMPTY_ARRAY;
        }
        else if (isSymbol(form[0])) {
            switch(form[0].name()) {
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
                    return emitBinOp(form, env_)
                case LT_SYM:
                    return emitBinOp(form, env_)
                case GT_SYM:
                    return emitBinOp(form, env_)
                case LTQ_SYM:
                    return emitBinOp(form, env_)
                case GTQ_SYM:
                    return emitBinOp(form, env_)
                case NOT_SYM:
                    return emitUnaryOp(form, env_, JS_NOT)
                case OR_SYM:
                    return emitVariableOp(form, env_, JS_OR);
                case AND_SYM:
                    return emitVariableOp(form, env_, JS_AND);
                case BIT_NOT_SYM:
                    return emitBinOp(form, env_, JS_BIT_NOT)
                case BIT_OR_SYM:
                    return emitBinOp(form, env_, JS_BIT_OR);
                case BIT_XOR_SYM:
                    return emitBinOp(form, env_, JS_BIT_XOR);
                case BIT_AND_SYM:
                    return emitBinOp(form, env_, JS_BIT_AND);
                case BIT_LSHIFT_SYM:
                    return emitBinOp(form, env_, JS_BIT_LSHIFT);
                case BIT_RSHIFT_SYM:
                    return emitBinOp(form, env_, JS_BIT_RSHIFT);
                case BIT_URSHIFT_SYM:
                    return emitBinOp(form, env_, JS_BIT_URSHIFT);
                case IDENTICAL_SYM:
                    return emitBinOp(form, env_, JS_IDENTICAL);
                case EQUIV_SYM:
                    return emitBinOp(form, env_, JS_EQUIV);
                case INSTANCE_SYM:
                    return emitBinOp(form, env_, JS_INSTANCE);
                case TYPE_SYM:
                    return emitUnaryOp(form, env_, JS_TYPEOF)
                case PLUS_SYM:
                case MINUS_SYM:
                case DIV_SYM:
                case MULT_SYM:
                    return emitVariableOp(form, env_);
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
        throw new Error(`Invalid form: ${prStr(form)}`);
    }
}
