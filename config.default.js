/* global rdf */

var acceptAllCertsRequest = require('./lib/utils/accept-all-certs-request');


var config = {
  hostname: 'localhost',
  port: 8443
};


config.appCtx = {};


config.modules = {
  express: {
    module: 'ldapp-express'
  },
  absoluteUrl: {
    module: 'ldapp-absolute-url',
    dependency: 'express'
  },
  core: {
    dependency: ['absoluteUrl','express']
  },
  authn: {
    module: 'ldapp-authn',
    dependency: ['core']
  },
  staticHosting: {
    module: 'ldapp-static',
    dependency: ['core']
  },
  corsProxy: {
    module: 'ldapp-cors-proxy',
    dependency: ['core']
  },
  graphStore: {
    module: './lib/graph-module',
    dependency: ['core']
  },
  listener: {
    module: 'ldapp-listener',
    dependency: [
      'core',
      'authn',
      'staticHosting',
      'corsProxy',
      'graphStore',
    ]
  }
};


// RDF Interfaces implementation + RDF-Ext
global.rdf = require('rdf-ext')();

// authentication
config.authn = {
  StoreClass: rdf.LdpStore,
  storeOptions: {
    request: acceptAllCertsRequest
  }
};

// static file hosting
config.static = [
  {
    route: '/',
    path: 'public/'
  }
];

// persistence store
config.store = new rdf.InMemoryStore();

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

// CORS proxy
config.cors = {
  path: '/cors',
  'request': acceptAllCertsRequest
};

config.session = {
  'secret': '1234567890'
};

// core
config.core = {
  'basePath': '',
  'proxy': false
};


config.expressSettings = {
  'trust proxy': 'loopback',
  'x-powered-by': null
};


config.listener = {
  hostname: config.hostname,
  port: config.port,
  tls: {
    keyFile: './data/localhost.key',
    certFile: './data/localhost.crt',
    requestCert: true
  }
};


module.exports = config;
