var
  antjs = require('antjs'),
  fs = require('fs'),
  path = require('path');


var loadConfig = function () {
  if (fs.existsSync('./data/config.js')) {
    return require('./data/config');
  } else {
    return require('./data/config.default');
  }
};


var config = loadConfig();


antjs.path = path.join(__dirname, 'lib/');
antjs.debug = process.env.NODE_ENV !== 'production';

antjs.load(config.modules, config)
  .catch(function (error) {
    console.error(error.stack || error.message);
  });
