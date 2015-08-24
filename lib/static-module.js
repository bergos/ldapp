var
  express = require('express'),
  path = require('path');


var initRoute = function (config, routeConfig) {
  config.app.use(routeConfig.route, express.static(path.join(process.cwd(), routeConfig.path)));

  return Promise.resolve();
};


module.exports = function () {
  var config = this;

  if (!config.static) {
    return Promise.resolve();
  }

  return Promise.all(config.static.map(function (routeConfig) {
    return initRoute(config, routeConfig);
  }));
};
