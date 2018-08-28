/**
 * @implements {Named, IObj}
 */
function Symbol(ns, name, meta) {
    this.$ns = ns;
    this.$name = name;
    this.$meta = meta || wonderscript.core.hashMap();
}

Symbol.intern = function(rep) {
    if (rep == null) throw new Error('Symbol reprentation cannot be nil');
    var i = rep.indexOf('/');
    if (i === -1 || rep === '/') {
        return new Sym(null, rep);
    }
    else {
        return new Sym(rep.substring(0, i), rep.substring(i + 1));
    }
};

Symbol.prototype.name = function() {
    return this.$name;
};

Symbol.prototype.namespace = function() {
    return this.$ns;
};

Symbol.prototype.toString = function() {
    if (this.$zera$ns == null) {
        return this.$name;
    }
    return str(this.$ns, '/', this.$name);
};

Symbol.prototype.isQualified = function() {
    return !!this.$ns;
};

// IObj
Symbol.prototype.withMeta = function(meta) {
    return new Sym(this.$ns, this.$name, meta);
};

// IObj, IMeta
Symbol.prototype.meta = function() {
    return this.$meta;
};

// Invokable
Symbol.prototype.invoke = function(args) {
    if (args.length != 1) throw new Error('Symbols expect one and only one argument');
    if (pbnj.utils.isFunction(args[0].apply)) {
        return args[0].apply(null, [this]);
    }
    else {
        throw new Error('Symbols expect and argument this is invokable');
    }
};

Symbol.prototype.equals = function(o) {
    if (o == null || !isSymbol(o)) return false;
    return this.$ns === o.$ns && this.$name === o.$name;
};

function isSymbol(x) {
    return x instanceof Symbol;
}

function symbol(x, y) {
    if (arguments.length === 1) {
        return new Symbol(null, x);
    }
    else if (arguments.length === 2) {
        return new Symbol(x, y);
    }
    throw new Error('Wrong number of arguments expected 1 or 2, got: ' + arguments.length);
}

module.exports = {
    Symbol,
    isSymbol,
    symbol
};
