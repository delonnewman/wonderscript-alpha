UGLIFY=npx uglifyjs
ROLLUP=npx rollup
WSC=./bin/wsc
WSI=./bin/wsi

all: dist/wonderscript.js dist/wonderscript/core.ws.js dist/wonderscript.min.js dist/wonderscript/core.ws.min.js

dist/wonderscript:
	mkdir -p dist/wonderscript

dist/wonderscript/core.ws.js: dist/wonderscript
	$(WSC) browser ./src/wonderscript/core.ws > dist/wonderscript/core.ws.js

dist/wonderscript/core.ws.min.js: dist/wonderscript/core.ws.js
	$(UGLIFY) dist/wonderscript/core.ws.js > dist/wonderscript/core.ws.min.js

dist/wonderscript.js:
	$(ROLLUP) -c

dist/wonderscript.min.js: dist/wonderscript.js
	$(UGLIFY) dist/wonderscript.js > dist/wonderscript.min.js

clean:
	rm -rf dist

deps:
	bun install

test: clean all test[unit] test[spec]

test[spec]:
	@echo
	@echo Running WonderScript Spec...
	@for file in $(shell find spec -name '*.ws' | sort); do \
		echo - $$file; \
		$(WSI) $$file; \
	done;

test[unit]:
	bun test

prettier:
	bun x prettier . --write

.PHONY: all clean deps spec test
