'use strict';

var Promise = require('es6-promise').Promise;


var CorsProxyModule = function (config) {
  var self = this;

  self.request = config.rdf.defaultRequest;

  if (!('cors' in config)) {
    config.cors = {};
  }

  if ('request' in config.cors) {
    self.request = config.cors.request;
  }

  var middleware = function (req, res) {
    var
      url = 'url' in req.query ? req.query.url : null,
      accept = 'accept' in req.headers ? req.headers.accept : null;

    if (url == null || accept == null) {
      return res.send(400);
    }

    self.request('GET', url, {'Accept': accept}, null,
      function (statusCode, headers, content, error) {
        if (error != null) {
          return res.send(500);
        }

        res.setHeader('Content-Type', headers['content-type']);
        res.send(200, content);
      }
    );
  };

  self.init = function (app, path) {
    return new Promise(function (resolve) {
      app.use(path, middleware);

      resolve(app);
    });
  };
};


module.exports = CorsProxyModule;