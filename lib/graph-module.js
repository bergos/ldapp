'use strict';

var
  expressUtils = require('express-utils'),
  fs = require('fs'),
  Promise = require('es6-promise').Promise;


var GraphModule = function (config) {
  var self = this;

  var initGraphs = function () {
    return new Promise(function (resolve) {
      console.log('init graphs...');

      // no graphs to load
      if (!('graphs' in config)) {
        return resolve();
      }

      var toLoad = Object.keys(config.graphs).length;

      // no graphs to load
      if (toLoad === 0) {
        return resolve();
      }

      var loadGraph = function (file, iri) {
        config.rdf.parseTurtle(fs.readFileSync(file).toString(), function (graph) {
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


  var initEvents = function (store) {
    return new Promise(function (resolve) {
      console.log('init store events...');

      self.events = new (require('./utils/event-store'))(store);

      //self.events.addListener('changed', function (iri) {
        // write the changed iri to console
        //console.log(iri + ' changed');

        // write the changed graph to console
        /*self.events.graph(iri, function(graph) {
          console.log(rdf.Graph.toNT(graph));
        });*/
      //});

      resolve(self.events);
    });
  };


  var initUac = function (store) {
    if (config.uac.disable) {
      return store;
    }

    return new Promise(function (resolve) {
      console.log('init uac...');

      var uac = require('uac')(config.rdf);

      self.ac = {};
      self.ac.parser = new uac.Parser();
      self.ac.ac = new uac.AccessControl();
      self.ac.store = new uac.Store(store, self.ac.ac);

      self.updateAccessControl()
        .then(function () { resolve(self.ac.store); });

      self.events.addListener('changed', function (iri) {
        if (iri !== config.uac.graph) {
          return;
        }

        self.updateAccessControl();
      });
    });
  };


  var initLdp = function (store) {
    return new Promise(function (resolve) {
      console.log('init ldp...');

      var Ldp = require('ldp');

      var ldp = new Ldp(config.rdf, store, {
        'log': console.log,
        'defaultAgent': config.ldp.defaultAgent
      });

      // translate realtive url from req.url to absolute path
      ldp.requestIri = function (req) {
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

      ldp.serializers['text/html'] = serializeHtml;

      resolve(ldp);
    });
  };

  var initAbsoluteUrl = function (app) {
    var options = {};

    if ('basePath' in config.core) {
      options.basePath = config.core.basePath;
    }

    return new Promise(function (resolve) {
      app.use(expressUtils.absoluteUrl(options));

      resolve();
    });
  };

  this.init = function (app) {
    return initGraphs()
      .then(function () { return initAbsoluteUrl(app); })
      .then(function () { return initEvents(config.store); })
      .then(function (store) { return initUac(store); })
      .then(function (store) { return initLdp(store); })
      .then(function (ldp) { app.use(ldp.middleware); })
      .then(function () { return app; });
  };


  this.updateAccessControl = function () {
    return new Promise(function (resolve) {
      console.log('update access control...');

      config.store.graph(config.uac.graph, function (graph) {
        if (graph == null) {
          console.warn('access control graph is null');

          return resolve();
        }

        var options = self.ac.parser.parse(graph);

        self.ac.ac.auths = options.auths;
        self.ac.ac.roles = options.roles;

        resolve();
      });
    });
  };
};


module.exports = GraphModule;