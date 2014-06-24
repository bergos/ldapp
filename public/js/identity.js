/* global Promise:false, rdf:false */
'use strict';


/**
 * Add Mozilla Persona based API to window.navigator
 */
if (!('id' in window.navigator)) {
  window.navigator.id = {};
}


/**
 * Passes authentication assertion to callback function
 *
 * @param callback
 */
window.navigator.id.get = function (callback) {
  rdf.defaultRequest('GET', '/login-assertion', {'Accept': 'application/json'}, null,
    function (statusCode, headers, content) {
      if (statusCode < 200 || statusCode >= 300) {
        return callback(null);
      }

      callback(content);
    }
  );
};


/**
 * Passes agent IRI (URL or acct URI) from authentication assertion using Promise
 *
 * @returns {Promise}
 */
window.navigator.id.get.agent = function () {
  return new Promise(function (resolve, reject) {
    window.navigator.id.get(function (assertion) {
      assertion = JSON.parse(assertion);

      if ('identity' in assertion.principal) {
        return resolve(assertion.principal.identity);
      }

      if ('email' in assertion.principal) {
        return resolve('acct:' + assertion.principal.email);
      }

      reject();
    });
  });
};