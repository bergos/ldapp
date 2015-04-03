var
  config = require('./data/config'),
  express = require('express'),
  coreModule = new (require('./lib/core-module'))(config),
  authNModule = new (require('./lib/authn-module'))(config),
  graphModule = new (require('./lib/graph-module'))(config),
  corsProxyModule = new (require('./lib/cors-proxy-module'))(config),
  listenerModule = new (require('./lib/listener-module'))(config);


coreModule.init()
  .then(function (app) { return authNModule.init(app); })
  .then(function (app) { app.use(express.static(__dirname + '/public')); return app; })
  .then(function (app) { return corsProxyModule.init(app, '/cors'); })
  .then(function (app) { return graphModule.init(app); })
  .then(function (app) { return listenerModule.init(app); })
  .then(function (app) {
    /*var fs = require('fs');

    config.rdf.parseTurtle(fs.readFileSync('./data/access1.ttl').toString(), function (graph) {
      graphModule.events.add('https://localhost:8443/.access', graph, function (added) {
        console.log('added: ' + added.toArray().length);
      });
    });*/

    return app;
  }).catch(function (error) {
    console.error(error.stack);
  });