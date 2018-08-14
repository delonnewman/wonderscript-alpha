all: dist/wonderscript/core.ws.js

dist/wonderscript:
	mkdir -p dist/wonderscript

dist/wonderscript/core.ws.js: dist/wonderscript
	./bin/wsc ./src/ws/wonderscript/core.ws > dist/wonderscript/core.ws.js

clean:
	rm -rf dist
