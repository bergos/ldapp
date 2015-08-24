var
  certUtils = require('./utils/cert-utils'),
  fs = require('fs'),
  http = require('http'),
  https = require('https');


var initTls = function (config) {
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
      key: pemKey,
      cert: pemCert,
      requestCert: true
    });
  });
};


var initListener = function (config) {
  // reverse proxy
  if (config.core.proxy) {
    config.app.set('trust proxy', true);
  }

  // use http
  if (config.tls.disable) {
    http.createServer(config.app).listen(config.core.port, config.core.host, function () {
      console.log('listen on: http://' + config.core.host + ':' + config.core.port);
    });

    return Promise.resolve();
  }

  // or https
  return initTls(config).then(function (tlsOptions) {
    https.createServer(tlsOptions, config.app).listen(config.core.port, config.core.host, function () {
      console.log('listen on: https://' + config.core.host + ':' + config.core.port);
    });

    return Promise.resolve();
  });
};


module.exports = function () {
  var config = this;

  return initListener(config);
};
