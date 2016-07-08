#! /usr/bin/env node

var program_name = process.argv[0];
var script_path = process.argv[1];
var sourceDir = process.argv[2];
var destDir = process.argv[3];

if (sourceDir === undefined || sourceDir === "") {
   console.log('please input source directory that contains html files for generation.\r\nExample: ngen sourceDir destDir');
   return;
}

if (destDir === undefined || destDir === "") {
   console.log('please output directory for generated ts files.\r\nExample: ngen sourceDir destDir');
   return;
}

var generator = require('./ngenc.js');
generator.generate(sourceDir, destDir);

