all: dist/wonderscript dist/wonderscript.js

dist/wonderscript:
	mkdir -p dist/wonderscript

dist/wonderscript/core.ws.js:
	./bin/wsc ./src/ws/wonderscript/core.ws > dist/wonderscript/core.ws.js

dist/wonderscript/core.js:
	cp src/js/wonderscript/core.js dist/wonderscript/

dist/wonderscript/edn.js:
	cp src/js/wonderscript/edn.js dist/wonderscript/

dist/wonderscript/compiler.js:
	cp src/js/wonderscript/compiler.js dist/wonderscript/

dist/wonderscript.js: dist/wonderscript/core.js dist/wonderscript/edn.js dist/wonderscript/compiler.js dist/wonderscript/core.ws.js
	cat dist/wonderscript/core.js dist/wonderscript/edn.js dist/wonderscript/compiler.js dist/wonderscript/core.ws.js > dist/wonderscript.js

clean:
	rm -rf dist

deps:
	npm install .

.PHONY: all clean deps
