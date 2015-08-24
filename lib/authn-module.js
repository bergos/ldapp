/* global rdf */

var
  acceptAllCertsRequest = require('./utils/accept-all-certs-request'),
  PubkeyLogin = require('pubkey-login');


var initPubkeyLogin = function (config) {
  //TODO: request should be configurable
  var store = new rdf.LdpStore({
    request: acceptAllCertsRequest
  });

  config.appCtx.pubkeyLogin = new PubkeyLogin({'rdf': rdf, 'store': store});
  config.app.use(config.appCtx.pubkeyLogin.middleware);

  return Promise.resolve();
};


var initAssertion = function (config) {
  config.app.use('/login-assertion', config.appCtx.pubkeyLogin.assertionMiddleware);

  return Promise.resolve();
};


module.exports = function () {
  var config = this;

  return initPubkeyLogin(config)
    .then(initAssertion.bind(null, config));
};