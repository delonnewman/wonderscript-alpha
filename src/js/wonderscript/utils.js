
function isInvocable(x) {
    return isFunction(x.invoke) || isFunction(x);
}

function apply(f, args) {
    if (isFunction(f)) {
        return f.apply(null, toArray(args));
    }
    else if (isInvokable(f)) {
        return f.invoke(args);
    }
    throw new Error('Value is not invokable: ' + f);
}
