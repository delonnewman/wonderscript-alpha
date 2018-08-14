all: dist/core.ws.js

dist:
	mkdir dist

dist/core.ws.js: dist
	./bin/wsc ./src/universe/core.ws > dist/core.ws.js
