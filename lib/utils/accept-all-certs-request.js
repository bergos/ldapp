'use strict';

var
  http = require('http'),
  https = require('https'),
  url = require('url');


var acceptAllCertsRequest = function (method, requestUrl, headers, content, callback) {
  var
    options = url.parse(requestUrl),
    client = http;

  options.hash = null;
  options.method = method;
  options.headers = headers;

  if (options.protocol === 'https:') {
    client = https;
    options.rejectUnauthorized = false;
  }

  var req = client.request(options, function (res) {
    var resContent = '';

    res.setEncoding('utf8');
    res.on('data', function (chunk) { resContent += chunk; });
    res.on('end', function () { callback(res.statusCode, res.headers, resContent); });
  });

  req.on('error', function (error) { callback(null, null, null, error); });

  if (content != null) {
    req.write(content);
  }

  req.end();
};


module.exports = acceptAllCertsRequest;