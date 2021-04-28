UGLIFY=npx uglifyjs

all: dist/wonderscript dist/wonderscript.js

dist/wonderscript:
	mkdir -p dist/wonderscript

dist/wonderscript/core.ws.js:
	./bin/wsc browser ./src/ws/wonderscript/core.ws > dist/wonderscript/core.ws.js

dist/wonderscript/core.js:
	$(UGLIFY) src/js/wonderscript/core.js > dist/wonderscript/core.js

dist/wonderscript/edn.js:
	$(UGLIFY) src/js/wonderscript/edn.js > dist/wonderscript/edn.js

dist/wonderscript/compiler.js:
	$(UGLIFY) src/js/wonderscript/compiler.js > dist/wonderscript/compiler.js

dist/wonderscript.js: dist/wonderscript/core.js dist/wonderscript/edn.js dist/wonderscript/compiler.js dist/wonderscript/core.ws.js
	cat dist/wonderscript/core.js dist/wonderscript/edn.js dist/wonderscript/compiler.js dist/wonderscript/core.ws.js > dist/wonderscript.js

#dist/wonderscript.min.js:


clean:
	rm -rf dist

deps:
	npm install .

.PHONY: all clean deps
