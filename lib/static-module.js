'use strict';


var
  express = require('express'),
  path = require('path');


var StaticModule = function (config) {
  var self = this;

  this.initRoute = function (routeConfig) {
    self.app.use(routeConfig.route, express.static(path.join(process.cwd(), routeConfig.path)));

    return Promise.resolve();
  };

  this.init = function (app) {
    self.app = app;

    if (!config.static) {
      return Promise.resolve();
    }

    var initRoutes = config.static.map(function (routeConfig) {
      return self.initRoute(routeConfig);
    });

    return Promise.all(initRoutes)
      .then(function () { return Promise.resolve(app); });
  };
};


module.exports = StaticModule;
