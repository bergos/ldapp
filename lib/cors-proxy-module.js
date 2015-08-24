/* global rdf */

var createCorsProxy = function (config) {
  config.cors = config.cors || {};

  var request = config.cors.request || rdf.defaultRequest;

  return function (req, res) {
    var url = req.query.url;
    var accept = req.headers.accept;

    if (!url || !accept) {
      return res.send(400);
    }

    request('GET', url, {'Accept': accept}, null, function (statusCode, headers, content, error) {
      if (error) {
        return res.send(500);
      }

      res.setHeader('Content-Type', headers['content-type']);
      res.send(200, content);
    });
  };
};


module.exports = function () {
  var config = this;

  config.appCtx.corsProxy = createCorsProxy(config);
  config.app.use(config.cors.path, config.appCtx.corsProxy);

  return Promise.resolve();
};