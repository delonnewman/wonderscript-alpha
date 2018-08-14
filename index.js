const ws = require('./src/universe/wonderscript.js');
if (process.env.NODE_ENV === 'production') {
    require('./dist/core.ws.js');
}
else {
    ws.loadFile(__dirname + '/src/universe/core.ws');
}
