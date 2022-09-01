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

dist/wonderscript.js:
	$(ROLLUP) -c

dist/wonderscript.min.js: dist/wonderscript.js
	$(UGLIFY) dist/wonderscript.js

clean:
	rm -rf dist

deps:
	npm install .

test:
	@for file in $(shell find test -name '*.ws'); do \
		$(WSI) $$file; \
	done;

.PHONY: all clean deps test
