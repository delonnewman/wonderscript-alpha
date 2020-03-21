// jshint esversion: 6
const c = require('./src/js/wonderscript/compiler.js');
const ws = {};
Object.assign(ws, wonderscript.core);
Object.assign(ws, c);

if (process.env.NODE_ENV === 'production') {
    require('./dist/wonderscript/core.ws.js');
}
else {
    ws.loadFile(__dirname + '/src/ws/wonderscript/core.ws');
}

module.exports = ws;
