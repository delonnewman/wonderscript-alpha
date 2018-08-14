const ws = require('./src/js/wonderscript/core.js');
if (process.env.NODE_ENV === 'production') {
    require('./dist/wonderscript/core.ws.js');
}
else {
    ws.loadFile(__dirname + '/src/ws/wonderscript/core.ws');
}

module.exports = ws;
