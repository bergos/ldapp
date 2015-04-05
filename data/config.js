'use strict';


global.Promise = require('es6-promise').Promise;


var
  config = {},
  acceptAllCertsRequest = require('../lib/utils/accept-all-certs-request');


// RDF Interfaces implementation + RDF-Ext
config.rdf = require('rdf-interfaces');
require('rdf-ext')(config.rdf);

// static file hosting
config.static = [
  {
    route: '/',
    path: 'public/'
  }
];

// persistence store
config.store = new config.rdf.InMemoryStore();

/*config.store = new config.rdf.SparqlStore({
  'endpointUrl': 'http://localhost:3030/ds/query',
  'updateUrl': 'http://localhost:3030/ds/update'
});*/

// initial graph data
config.graphs = {
  'https://localhost:8443/.access': './data/access.ttl',
  'https://localhost:8443/blog': './data/blog.ttl',
  'https://localhost:8443/card': './data/card.ttl'
};

// WebID
config.webid = {
  'iri': 'https://localhost:8443/card#me',
  'keyFile': './data/webid.key',
  'certFile': './data/webid.crt',
  'pkcs12File': './data/webid.p12'
};

// UAC
config.uac = {
  'disable': false,
  'graph': 'https://localhost:8443/.access'
};

// LDP
config.ldp = {
  'defaultAgent': 'https://localhost:8443/anonymous#me'
};

// tls
config.tls = {
  'disable': false,
  'keyFile': './data/localhost.key',
  'certFile': './data/localhost.crt'
};

// CORS proxy
config.cors = {
  'request': acceptAllCertsRequest
};

config.session = {
  'secret': '1234567890'
};

// core
config.core = {
  'host': 'localhost',
  'port': '8443',
  'basePath': '',
  'proxy': false
};

module.exports = config;