var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var util = require('util');
var camel = require('to-camel-case');
var capital = require('to-capital-case');
var jsdom = require("jsdom");

const ANGULAR_IMPORT = `import { Component } from '@angular/core';
%s`;

const ANGULAR_COMPONENT = `@Component({
  selector:'%s',
  template:\`
      %s
  \`,
  directives: [%s],
  styles: []
})`;

const ANGULAR_CLASS = `export class %s {

}
`;


/**
 * ngen
 * https://github.com/jasondu168/ngen.git
 *
 * Copyright (c) 2016 Jason
 * Licensed under the MIT license.
 */

/**
 * Escape special characters in the given string of html.
 *
 * @param  {String} sourceDir
 * @param  {String} destDir
 * @param  {String} rootTag
 * @return {String}
 */
module.exports = {
    generate: function (sourceDir, destDir, rootTag) {
	    console.log("sourceDir: " + sourceDir);
	    console.log("destDir: " + destDir);
	    console.log("rootTag: " + rootTag);

	    var done = function (para, files) {
	        if (files === null || files === undefined) { return }

	        for (var i = 0; i < files.length; i++) {
	            if (files[i].indexOf('.htm') < 0) {
	                continue;
	            }
	            fs.readFile(files[i], 'utf8', function (err, data) {
	                if (err) {
	                    return console.log(err);
	                }

	                var document = jsdom.jsdom(data);
	                function getNodeType(node) {
	                    if (node === null || node === undefined) return "[object Null]";
	                    return node.toString();
	                }

	                function contains(a, obj) {
	                    var i = a.length;
	                    while (i--) {
	                        if (a[i] === obj) {
	                            return true;
	                        }
	                    }
	                    return false;
	                }
	                var tags = [];
	                var directives = [];
	                var components = [];
	                var htmltags = [];
	                var getSubComponentsImport = function (childParents, subComponents) {
	                    var component = "";
	                    for (var j = 0; j < subComponents.length; j++) {
	                        component += "import { " + capital(camel(subComponents[j])) + "Component } from '" + childParents[0].toLowerCase() + "/" + subComponents[j] + "';\r\n";
	                    }
	                    return component;
	                }
	                
	                // generate component source code
	                var visit = function (node, parentTagPath, parentNodeName) {

	                    if (node === null || node === undefined || node.tagName === undefined) {
	                        return;
	                    }

	                    parentTagPath = parentTagPath.toLowerCase();
	                    parentNodeName = parentNodeName.toLowerCase();

	                    // tags
	                    if ("[object HTMLUnknownElement]" === getNodeType(node)) {
	                        if (tags.indexOf(parentTagPath + "/" + node.tagName.toLowerCase()) < 0) {
	                            tags.push(parentTagPath + "/" + node.tagName.toLowerCase());
	                            directives.push(node.tagName.toLowerCase());

	                            var abosolutePath = path.join(destDir, (parentTagPath + "/" + node.tagName).toLowerCase());
	                            if (!fs.existsSync(abosolutePath)) {
	                                mkdirp(abosolutePath);
	                            }
	                        }
	                    }

	                    var subComponents = [];
	                    var templates = [];
	                    var childParents = [];
	                    var childParentNames = [];

	                    // get sub components
	                    for (var j = 0; j < node.childNodes.length; j++) {
	                        var childsParentTagPath = parentTagPath;
	                        var childsParentNodeName = parentNodeName;
	                        if ("[object HTMLUnknownElement]" === getNodeType(node)) {
	                            childsParentTagPath += "/" + node.tagName.toLowerCase();
	                            childsParentNodeName = node.tagName.toLowerCase();
	                        }

	                        visit(node.childNodes[j], childsParentTagPath, childsParentNodeName);
	                        
	                        if ("[object HTMLUnknownElement]" === getNodeType(node.childNodes[j])) {
	                            if (subComponents.indexOf(node.childNodes[j].tagName.toLowerCase()) < 0) {
	                                subComponents.push(node.childNodes[j].tagName.toLowerCase());
	                            }
	                        }

	                        if (childsParentTagPath != undefined) {
	                            childParents.push(childsParentTagPath);
	                            childParentNames.push(childsParentNodeName);
	                            templates.push(node.innerHTML); //only one
	                        }
	                    }
                        
                        // generate sub components
	                    if (subComponents.length > 0) {
	                        if (childParentNames[0] != "") {
	                            var importComponents = util.format(ANGULAR_IMPORT,
	                                    getSubComponentsImport(childParents, subComponents));

	                            var directive = getSubComponentsImport(childParents, subComponents);
	                            var template = util.format(ANGULAR_COMPONENT
	                                , childParentNames[0].toLowerCase()
	                                , templates[0]
	                                , subComponents.join(","));

	                            var exportClass = util.format(ANGULAR_CLASS
	                                , capital(camel(childParentNames[0])) + "Component");

	                            componentPath = childParents[0];
	                            var abosolutePath = path.join(destDir, componentPath);

	                            if (!fs.existsSync(abosolutePath)) {
	                                mkdirp(abosolutePath);
	                            }
	                            
	                            fs.writeFile(path.join(destDir, componentPath,
	                                capital(camel(childParentNames[0])) + "Component" + ".ts"), importComponents + template + exportClass, function (err) {
	                                    if (err) return console.log(err);
	                                });

	                            console.log(importComponents);
	                            console.log(template);
	                            console.log(exportClass);
	                        }
	                    } else {
	                        if ("[object HTMLUnknownElement]" === getNodeType(node) && childParentNames[0] != undefined) {
	                            var template = util.format(ANGULAR_COMPONENT
	                                , childParentNames[0].toLowerCase()
	                                , templates[0]
	                                , "");

	                            var exportClass = util.format(ANGULAR_CLASS
	                                , capital(camel(node.tagName)) + "Component");

	                            componentPath = childParents[0];
	                            var abosolutePath = path.join(destDir, componentPath);

	                            if (!fs.existsSync(abosolutePath)) {
	                                mkdirp(abosolutePath);
	                            }

	                            fs.writeFile(path.join(destDir, componentPath,
	                                capital(camel(node.tagName)) + "Component" + ".ts"), template + exportClass, function (err) {
	                                    if (err) return console.log(err);
	                                });
                                //no import class here
	                            console.log(template);
	                            console.log(exportClass);
	                        }
	                    }
	                }

	                //from HTML tag
	                visit(document.childNodes[0], "", "");
	            });
	            
	        }
	    }

	    var walk = function (dir, done) {
	        console.log(dir);
	        var results = [];
	        fs.readdir(dir, function (err, list) {
	            if (err) return done(err);
	            var i = 0;
	            (function next() {
	                var file = list[i++];
	                if (!file) return done(null, results);
	                file = dir + '/' + file;
	                fs.stat(file, function (err, stat) {
	                    if (stat && stat.isDirectory()) {
	                        walk(file, function (err, res) {
	                            results = results.concat(res);
	                            next();
	                        });
	                    } else {
	                        results.push(file);
	                        next();
	                    }
	                });
	            })();
	        });
	    };

	    console.log('begin to generate angular2 components. current output directory : ' + destDir);
	    walk(sourceDir, done);
	}
};
