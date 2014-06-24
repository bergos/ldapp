'use strict';

var
  express = require('express'),
  Promise = require('es6-promise').Promise;


var coreModule = function (config) {
  var self = this;

  self.init = function () {
    return new Promise(function (resolve) {
      var app = express();

      app.use(express.cookieParser());
      app.use(express.session(config.session));

      resolve(app);
    });
  };
};


module.exports = coreModule;