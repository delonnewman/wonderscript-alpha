function Keyword(sym) {
    this.$sym = sym;
}

Keyword.table = {};

Keyword.intern = function(sym_) {
    var sym = isSymbol(sym_) ? sym_ : Sym.intern(sym_);
    var kw = Keyword.table[sym];
    if (!kw) kw = Keyword.table[sym] = new Keyword(sym);
    return kw;
};

Keyword.prototype.name = function() {
    return this.$sym.name();
};

Keyword.prototype.namespace = function() {
    return this.$sym.namespace();
};

Keyword.prototype.toString = function() {
    return str(':', this.$sym);
};

Keyword.prototype.equals = function(o) {
    if (o == null || !isKeyword(o)) return false;
    return this.namespace() === o.namespace() && this.name() === o.name();
};


// Invokable
Keyword.prototype.invoke = function(args) {
    if (args.length !== 1) throw new Error('Keywords expect one and only one argument');
    if (pbnj.utils.isFunction(args[0].apply)) {
        return args[0].apply(null, [this]);
    }
    else {
        throw new Error('Keywords expect an argument this is invokable');
    }
};
