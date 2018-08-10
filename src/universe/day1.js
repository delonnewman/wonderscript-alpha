function identity(x) {
    return x;
}

function square(x) {
    return x * x;
}

function add1(x) {
    return 1 + x;
}

function fib(n) {
    if (n <= 0) return 0;
    else if (n === 1) return 1;
    else {
        return fib(n - 1) + fib(n - 2);
    }
}

var p = console.log.bind();

p([1, 2, 3].map(add1)); // => [2, 3, 4]
p([1, 2, 3].map(square)); // => [1, 4, 9]
p([1, 2, 3].map(fib)); // => [1, 1, 2]
