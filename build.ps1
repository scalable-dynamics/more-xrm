Remove-Item -path "./lib" -recurse

tsc -m es6 --outDir "./lib/es6"

tsc -m commonjs --outDir "./lib/commonjs"

tsc -m amd --outFile "./lib/amd/more-xrm.js"

tsc -m system --outFile "./lib/system/more-xrm.js"
