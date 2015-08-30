/* global rdf */

var fs = require('fs');


var initGraphs = function (config) {
  return new Promise(function (resolve) {
    console.log('init graphs...');

    // no graphs to load
    if (!config.graphs) {
      return resolve();
    }

    var toLoad = Object.keys(config.graphs).length;

    // no graphs to load
    if (toLoad === 0) {
      return resolve();
    }

    var loadGraph = function (file, iri) {
      rdf.parseTurtle(fs.readFileSync(file).toString(), function (graph) {
        if (graph == null) {
          if (--toLoad === 0) {
            resolve();
          }
        } else {
          config.store.add(iri, graph, function () {
            if (--toLoad === 0) {
              resolve();
            }
          });
        }
      }, iri);
    };

    for (var iri in config.graphs) {
      loadGraph(config.graphs[iri], iri);
    }
  });
};

var initEvents = function (config, store) {
  var EventStore = require('./utils/event-store')(rdf);

  console.log('init store events...');

  config.appCtx.storeEvents = new EventStore(store);

  /*config.appCtx.storeEvents.on('changed', function (iri) {
    // write the changed iri to console
    console.log(iri + ' changed');
  });*/

  return Promise.resolve(config.appCtx.storeEvents);
};


var initUac = function (config, store) {
  if (config.uac.disable) {
    return Promise.resolve(store);
  }

  console.log('init uac...');

  config.appCtx.updateAccessControl = function () {
    return new Promise(function (resolve) {
      console.log('update access control...');

      config.store.graph(config.uac.graph, function (graph) {
        if (!graph) {
          console.warn('access control graph is null');

          return resolve();
        }

        var options = config.appCtx.accessControl.parser.parse(graph);

        config.appCtx.accessControl.ac.auths = options.auths;
        config.appCtx.accessControl.ac.roles = options.roles;

        resolve(config.appCtx.accessControl.store);
      });
    });
  };

  var uac = require('uac')(rdf);

  config.appCtx.accessControl = {};
  config.appCtx.accessControl.parser = new uac.Parser();
  config.appCtx.accessControl.ac = new uac.AccessControl();
  config.appCtx.accessControl.store = new uac.Store(store, config.appCtx.accessControl.ac);

  config.appCtx.storeEvents.on('changed', function (iri) {
    if (iri !== config.uac.graph) {
      return;
    }

    config.appCtx.updateAccessControl();
  });

  return config.appCtx.updateAccessControl();
};


var initLdp = function (config, store) {
  console.log('init ldp...');

  var Ldp = require('ldp');

  config.appCtx.ldp = new Ldp(rdf, store, {
    log: console.log,
    defaultAgent: config.ldp.defaultAgent
  });

  // translate realtive url from req.url to absolute path
  config.appCtx.ldp.requestIri = function (req) {
    return req.absoluteUrl();
  };

  // simple html graph serializer
  var serializeHtml = function (graph, callback) {
    var html = '<html><body><table>';

    graph.forEach(function (triple) {
      html += '<tr>';

      html += '<td>' + triple.subject.valueOf() + '</td>';
      html += '<td>' + triple.predicate.valueOf() + '</td>';
      html += '<td>' + triple.object.valueOf() + '</td>';

      html += '</tr>';
    });

    html += '</table></body></html>';

    callback(html);

    return html;
  };

  config.appCtx.ldp.serializers['text/html'] = serializeHtml;

  config.app.use(config.appCtx.ldp.middleware);

  return Promise.resolve();
};


module.exports = function () {
  var config = this;

  return initGraphs(config)
    .then(initEvents.bind(null, config, config.store))
    .then(initUac.bind(null, config))
    .then(initLdp.bind(null, config));
};
