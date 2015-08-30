var certUtils = require('./lib//utils/cert-utils')
var fs = require('fs')

var loadConfig = function () {
  if (fs.existsSync('./config.js')) {
    return require('./config')
  } else {
    return require('./config.default')
  }
}

var config = loadConfig()

var key = certUtils.generateRsaKeyPair()
var cert = certUtils.createSelfSignedCert(key, config.listener.hostname)
var pemKey = certUtils.dumpPemPrivateKey(key)
var pemCert = certUtils.dumpPemCert(cert)

fs.writeFileSync(config.listener.tls.keyFile, pemKey)
fs.writeFileSync(config.listener.tls.certFile, pemCert)
