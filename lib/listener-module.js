'use strict';


var
  certUtils = require('./utils/cert-utils'),
  fs = require('fs'),
  http = require('http'),
  https = require('https'),
  Promise = require('es6-promise').Promise;


var ListenerModule = function (config) {
  var self = this;

  var initTls = function () {
    return new Promise(function (resolve) {
      console.log('init tls...');

      var
        pemKey = null,
        pemCert = null;

      try {
        pemKey = fs.readFileSync(config.tls.keyFile).toString();
        pemCert = fs.readFileSync(config.tls.certFile).toString();
      } catch (e) {}

      if (pemKey == null || pemCert == null) {
        var
          key = certUtils.generateRsaKeyPair(),
          cert = certUtils.createSelfSignedCert(key, config.core.host);

        pemKey = certUtils.dumpPemPrivateKey(key);
        pemCert = certUtils.dumpPemCert(cert);

        fs.writeFileSync(config.tls.keyFile, pemKey);
        fs.writeFileSync(config.tls.certFile, pemCert);
      }

      resolve({
        'key': pemKey,
        'cert': pemCert,
        'requestCert': true
      });
    });
  };


  var initListener = function (app) {
    // reverse proxy
    if (config.core.proxy) {
      app.set('trust proxy', true);
    }

    // use http
    if (config.tls.disable) {
      http.createServer(app).listen(config.core.port, config.core.host, function () {
        console.log('listen on: http://' + config.core.host + ':' + config.core.port);
      });

      return app;
    }

    // or https
    return initTls().then(function (tlsOptions) {
      https.createServer(tlsOptions, app).listen(config.core.port, config.core.host, function () {
        console.log('listen on: https://' + config.core.host + ':' + config.core.port);
      });

      return app;
    });
  };


  self.init = function (app) {
    return initListener(app);
  };
};


module.exports = ListenerModule;