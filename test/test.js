'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var File = require('vinyl');
var contents = require('file-contents');
var extend = require('extend-shallow');
var assert = require('assert');
var dry = require('..');

var fixtures = path.resolve.bind(path, __dirname, 'fixtures');

function expected(filepath, options) {
  var file = createFile(path.join(__dirname, 'expected', filepath), options);
  return file.contents.toString();
}

function createFile(filepath, options) {
  var opts = extend({cwd: process.cwd()}, options);
  opts.path = fixtures(filepath);
  var file = new File(opts);
  file.cwd = opts.cwd;
  file.base = opts.cwd;
  contents.sync(file);
  if (opts.extends) file.extends = opts.extends;
  if (opts.layout) file.layout = opts.layout;
  return file;
}

function createTest(filename, block, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  var opts = extend({ files: fixtures(block) }, options);
  var stream = dry(opts);
  var buffer = [];

  stream.write(createFile(filename));
  stream.on('data', function (file) {
    buffer.push(file);
  });

  stream.on('end', function () {
    var file = buffer[0];
    var str = file.contents.toString();
    assert.equal(str, expected(filename));
    cb();
  });
  stream.end();
}

describe('gulp-dry', function () {
  describe('blocks', function () {
    it('should render blocks in a template', function (cb) {
      createTest('block.html', 'blocks/basic.html', cb);
    });

    it('should render nested blocks in a template', function (cb) {
      createTest('block-multiple.html', 'blocks/multiple.html', cb);
    });

    it('should render multiple nested blocks', function (cb) {
      createTest('nested-blocks.html', 'blocks/nested-blocks.html', cb);
    });

    it('should replace blocks', function (cb) {
      createTest('nested-extends.html', 'blocks/*.html', cb);
    });

    it('should prepend blocks', function (cb) {
      createTest('nested-extends-prepend.html', 'blocks/*.html', cb);
    });

    it('should append blocks', function (cb) {
      createTest('nested-extends-append.html', 'blocks/*.html', cb);
    });

    it('should merge blocks', function (cb) {
      createTest('merge-blocks.html', 'blocks/merge-blocks.html', cb);
    });
  });

  describe('layouts', function () {
    it('should render text nodes in a template', function (cb) {
      createTest('layout-text-node.html', 'blocks/*.html', cb);
    });

    it('should render a layout with blocks', function (cb) {
      createTest('layout-block.html', 'blocks/*.html', cb);
    });

    it('should replace blocks in the parent layout', function (cb) {
      createTest('layout-tag-replace.html', 'blocks/*.html', cb);
    });
  });

  describe('helpers', function () {
    it('should use block helpers', function (cb) {
      createTest('layout-text-node.html', 'blocks/*.html', {
        helpers: {
          block: function(options) {
            return this.fn();
          }
        }
      }, cb);
    });
  });
});
