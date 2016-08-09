'use strict';

var utils = require('./utils');

function plugin(options) {
  var opts = utils.extend({cwd: process.cwd()}, options);

  if (utils.isGlob(opts.files)) {
    opts.files = utils.loadBlocks(opts.files, opts);
  }

  return utils.through.obj(function(file, enc, next) {
    if (file.isNull()) {
      next(null, file);
      return;
    }
    utils.contents.async(file, function(err, res) {
      if (err) {
        next(err);
        return;
      }
      next(null, utils.dry(res, opts));
    });
  });
};

/**
 * Expose `plugin`
 */

module.exports = plugin;
