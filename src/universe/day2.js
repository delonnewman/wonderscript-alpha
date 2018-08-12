// jshint eqnull: true
// jshint esversion: 6

const { first, rest, next, cons, isEmpty, map, reduce, print, memoize, range, partition, str, apply, html, renderTo, appendTo } = universe.core;

const fib = memoize(function(n) {
    if (n <= 1) return 1;
    else {
        return fib(n - 1) + fib(n - 2);
    }
});

function fibNaive(n) {
    if (n <= 1) return 1;
    else {
        return fibNaive(n - 1) + fibNaive(n - 2);
    }
}

function map1(f, xs) {
    if (isEmpty(xs)) {
        return [];
    }
    else {
        return cons(f(x), map1(f, rest(xs)));
    }
}

function reduce1(f, xs, init) {
    if (init == null) {
        init = first(xs);
        xs   = rest(xs);
    }
    if (isEmpty(xs)) {
        return init;
    }
    else {
        return reduce1(f, rest(xs), f(init, x));
    }
}

function map2(f, xs) {
    return reduce(function(a, x) {
        return a.concat(f(x));
    }, xs, []);
}
