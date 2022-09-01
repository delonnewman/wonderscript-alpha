const {Compiler} = require('./dist/wonderscript.js');
const ws = new Compiler('node', global);

if (process.env.NODE_ENV === 'production') {
    require('./dist/wonderscript/core.ws.js');
}
else {
    ws.loadFile(__dirname + '/src/wonderscript/core.ws');
}


module.exports = ws