UGLIFY=npx uglifyjs
ROLLUP=npx rollup

all: dist/wonderscript.js dist/wonderscript/core.ws.js

dist/wonderscript:
	mkdir -p dist/wonderscript

dist/wonderscript/core.ws.js: dist/wonderscript
	./bin/wsc browser ./src/wonderscript/core.ws > dist/wonderscript/core.ws.js

dist/wonderscript.js:
	npx rollup -c

clean:
	rm -rf dist

deps:
	npm install .

.PHONY: all clean deps
