'use strict';

var
  acceptAllCertsRequest = require('./utils/accept-all-certs-request'),
  Promise = require('es6-promise').Promise,
  PubkeyLogin = require('pubkey-login');


var AuthNModule = function (config) {
  var self = this;

  var initPubkeyLogin = function (app) {
    return new Promise(function (resolve) {
      //TODO: request should be configurable
      var store = new config.rdf.LdpStore(
        {'request': acceptAllCertsRequest});

      self.pubkeyLogin = new PubkeyLogin({'rdf': config.rdf, 'store': store});

      app.use(self.pubkeyLogin.middleware);

      resolve();
    });
  };

  var initAssertion = function (app) {
    return new Promise(function (resolve) {
      app.use('/login-assertion', self.pubkeyLogin.assertionMiddleware);

      resolve(app);
    });
  };

  self.init = function (app) {
    return initPubkeyLogin(app)
      .then(function () { return initAssertion(app); });
  };
};


module.exports = AuthNModule;