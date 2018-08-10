// jshint eqnull: true
// jshint esversion: 6

const { first, rest, cons, isEmpty, map, reduce, print, memoize, range } = universe.core;

function fib(n) {
    if (n <= 0) return 0;
    else if (n === 1) return 1;
    else {
        return fib(n - 1) + fib(n - 2);
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

//print(map(memoize(fib), range(10)));
