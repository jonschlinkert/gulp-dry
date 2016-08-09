'use strict';

var path = require('path');
var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('dry');
require('extend-shallow', 'extend');
require('file-contents', 'contents');
require('has-glob');
require('matched', 'glob');
require('through2', 'through');
require('vinyl', 'File');
require = fn;

utils.isGlob = function(pattern) {
  return utils.hasGlob(pattern) || Array.isArray(pattern) || typeof pattern === 'string';
};

utils.loadBlocks = function(patterns, options) {
  var opts = utils.extend({cwd: process.cwd()}, options);
  return utils.glob.sync(patterns, opts)
    .reduce(function(acc, filepath) {
      var file = utils.createFile(filepath, opts);
      var ast;

      Object.defineProperty(file, 'ast', {
        configurable: true,
        enumerable: true,
        set: function(val) {
          ast = val;
        },
        get: function() {
          return ast || (ast = utils.dry.parse(this, opts));
        }
      });

      acc[file.relative] = file;
      return acc;
    }, {});
}

utils.createFile = function(filepath, options) {
  var opts = utils.extend({cwd: process.cwd()}, options);
  opts.path = path.resolve(opts.cwd, filepath);
  var file = new utils.File(opts);
  file.cwd = opts.cwd;
  file.base = opts.cwd;
  utils.contents.sync(file, opts);
  return file;
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
