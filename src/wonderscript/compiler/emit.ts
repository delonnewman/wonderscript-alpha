import {macroexpand} from "./macroexpand";
import {Form} from "./core";
import {emitKeyword} from "./emit/emitKeyword";
import {isArray, isBoolean, isMap, isNull, isNumber, isSet, isString, isUndefined} from "../lang/runtime";
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
    JS_BIT_LSHIFT,
    JS_BIT_NOT,
    JS_BIT_OR,
    JS_BIT_RSHIFT,
    JS_BIT_URSHIFT,
    JS_BIT_XOR,
    JS_EQUIV,
    JS_IDENTICAL,
    JS_INSTANCE,
    JS_NOT,
    JS_NOT_EQUIV,
    JS_NOT_IDENTICAL,
    JS_OR,
    JS_SYM,
    JS_TYPEOF,
    LET_SYM,
    LOOP_SYM,
    LT_SYM,
    LTQ_SYM,
    MINUS_SYM,
    MOD_SYM,
    MULT_SYM,
    NEW_SYM,
    NOT_EQUIV_SYM,
    NOT_IDENTICAL_SYM,
    NOT_SYM,
    NULL_SYM,
    OR_SYM,
    PLUS_SYM,
    QUOTE_SYM,
    RECUR_SYM,
    SET_SYM,
    THROW_SYM,
    TRUE_SYM,
    BEGIN_SYM,
    TYPE_SYM,
    UNDEFINED_SYM,
    SLOT_SYM,
    HAS_SLOT_SYM,
    SSET_SYM
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
import {emitBegin} from "./emit/emitBegin";
import {emitLet} from "./emit/emitLet";
import {emitObjectRes} from "./emit/emitObjectRes";
import {emitClassInit} from "./emit/emitClassInit";
import {emitAssignment} from "./emit/emitAssignment";
import {emitVariableOp} from "./emit/emitVariableOp";
import {emitFuncApplication} from "./emit/emitFuncApplication";
import {Context} from "../lang/Context";
import {emitJS} from "./emit/emitJS";
import {emitUnaryOp} from "./emit/emitUnaryOp";
import {emitBinOp} from "./emit/emitBinOp";
import {isKeyword} from "../lang/Keyword";
import {isSymbol} from "../lang/Symbol";
import {prStr} from "./prStr";
import {emitSlotAccess} from "./emit/emitSlotAccess";
import {emitSlotInspection} from "./emit/emitSlotInspection";
import {emitSet} from "./emit/emitSet";
import {emitSlotMutation} from "./emit/emitSlotMutation";
import {isVector} from "../lang/Vector";
import {emitVector} from "./emit/emitVector";

export function emit(form_: Form, ctx: Context) {
    const form = macroexpand(form_, ctx);
    if (isKeyword(form)) {
        return emitKeyword(form);
    }
    else if (isSymbol(form)) {
        return emitSymbol(form, ctx);
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
    else if (isMap(form)) {
        return emitMap(form, ctx);
    }
    else if (isSet(form)) {
        return emitSet(form, ctx);
    }
    else if (isArray(form)) {
        if (form.length === 0) {
            return EMPTY_ARRAY;
        }
        else if (isSymbol(form[0])) {
            switch(form[0].name()) {
                // special forms
                case DEF_SYM:
                    return emitDef(form, ctx);
                case QUOTE_SYM:
                    return emitQuote(form);
                case COND_SYM:
                    return emitCond(form, ctx);
                case JS_SYM:
                    return emitJS(form);
                case FN_SYM:
                    return emitFunc(form, ctx);
                case LOOP_SYM:
                    return emitLoop(form, ctx);
                case RECUR_SYM:
                    throw new Error(RECUR_ERROR_MSG);
                case THROW_SYM:
                    return emitThrownException(form, ctx);
                case BEGIN_SYM:
                    return emitBegin(form, ctx);
                case LET_SYM:
                    return emitLet(form, ctx);
                case DOT_SYM:
                    return emitObjectRes(form, ctx);
                case NEW_SYM:
                    return emitClassInit(form, ctx);
                case SET_SYM:
                    return emitAssignment(form, ctx);
                // operators
                case SLOT_SYM:
                    return emitSlotAccess(form, ctx);
                case HAS_SLOT_SYM:
                    return emitSlotInspection(form, ctx);
                case SSET_SYM:
                    return emitSlotMutation(form, ctx);
                case MOD_SYM:
                    return emitBinOp(form, ctx)
                case LT_SYM:
                    return emitBinOp(form, ctx)
                case GT_SYM:
                    return emitBinOp(form, ctx)
                case LTQ_SYM:
                    return emitBinOp(form, ctx)
                case GTQ_SYM:
                    return emitBinOp(form, ctx)
                case NOT_SYM:
                    return emitUnaryOp(form, ctx, JS_NOT)
                case OR_SYM:
                    return emitVariableOp(form, ctx, JS_OR);
                case AND_SYM:
                    return emitVariableOp(form, ctx, JS_AND);
                case BIT_NOT_SYM:
                    return emitBinOp(form, ctx, JS_BIT_NOT)
                case BIT_OR_SYM:
                    return emitBinOp(form, ctx, JS_BIT_OR);
                case BIT_XOR_SYM:
                    return emitBinOp(form, ctx, JS_BIT_XOR);
                case BIT_AND_SYM:
                    return emitBinOp(form, ctx, JS_BIT_AND);
                case BIT_LSHIFT_SYM:
                    return emitBinOp(form, ctx, JS_BIT_LSHIFT);
                case BIT_RSHIFT_SYM:
                    return emitBinOp(form, ctx, JS_BIT_RSHIFT);
                case BIT_URSHIFT_SYM:
                    return emitBinOp(form, ctx, JS_BIT_URSHIFT);
                case IDENTICAL_SYM:
                    return emitBinOp(form, ctx, JS_IDENTICAL);
                case NOT_IDENTICAL_SYM:
                    return emitBinOp(form, ctx, JS_NOT_IDENTICAL);
                case EQUIV_SYM:
                    return emitBinOp(form, ctx, JS_EQUIV);
                case NOT_EQUIV_SYM:
                    return emitBinOp(form, ctx, JS_NOT_EQUIV);
                case INSTANCE_SYM:
                    return emitBinOp(form, ctx, JS_INSTANCE);
                case TYPE_SYM:
                    return emitUnaryOp(form, ctx, JS_TYPEOF)
                case PLUS_SYM:
                case MINUS_SYM:
                case DIV_SYM:
                case MULT_SYM:
                    return emitVariableOp(form, ctx);
                case AGET_SYM:
                    return emitArrayAccess(form, ctx);
                case ASET_SYM:
                    return emitArrayMutation(form, ctx);
                case ALENGTH_SYM:
                    return emitArrayLength(form, ctx);
                default:
                    return emitFuncApplication(form, ctx);
            }
        }
        else {
            return emitFuncApplication(form, ctx);
        }
    }
    else if (isVector(form)) {
        return emitVector(form, ctx);
    }
    else {
        throw new Error(`Invalid form: ${prStr(form)}`);
    }
}
