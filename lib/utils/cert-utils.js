'use strict';

var forge = require('node-forge');


var certUtils  = {};


certUtils.generateRsaKeyPair = function () {
  return forge.pki.rsa.generateKeyPair(4096);
};


certUtils.generateSerial = function () {
  return forge.util.createBuffer()
    .putByte(forge.random.getBytesSync(1).charCodeAt(0) & 0x7f)
    .putBytes(forge.random.getBytesSync(19)).toHex();
};


certUtils.parsePemPrivateKey = function (pem) {
  return forge.pki.privateKeyFromPem(pem);
};


certUtils.parsePemPublicKey = function (pem) {
  return forge.pki.publicKeyFromPem(pem);
};


certUtils.dumpPemPrivateKey = function  (key) {
  return forge.pki.privateKeyToPem(key.privateKey);
};


certUtils.parsePemCert = function (pem) {
  return forge.pki.certificateFromPem(pem);
};


certUtils.dumpPemCert = function (cert) {
  return forge.pki.certificateToPem(cert);
};


certUtils.createSelfSignedCert = function (key, commonName, options) {
  if (options == null) {
    options = {};
  }

  var
    cert = forge.pki.createCertificate(),
    attributes,
    extensions;

  cert.publicKey = key.publicKey;
  cert.serialNumber = typeof options.serialNumber !== 'undefined' ? options.serialNumber : certUtils.generateSerial();
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  attributes = [{
    'name': 'commonName',
    'value': commonName
  }];

  cert.setSubject(attributes);
  cert.setIssuer(attributes);

  extensions = [{
    'name': 'basicConstraints',
    'cA': true
  }, {
    'name': 'keyUsage',
    'keyCertSign': true
  }, {
    'name': 'nsCertType',
    'server': true//,
  }];

  cert.setExtensions(extensions);

  cert.sign(key.privateKey);

  return cert;
};


module.exports = certUtils;