/* global describe:false, it:false */

var
  fs = require('fs'),
  https = require('https'),
  url = require('url');


describe('LdApp', function () {
  it('add webid', function (done) {
    var options = url.parse('https://localhost:8443/card');

    options.method = 'PATCH';
    options.headers = {'Content-Type': 'text/turtle'};
    options.key = fs.readFileSync('data/webid.key').toString();
    options.cert = fs.readFileSync('data/webid.crt').toString();
    options.rejectUnauthorized = false;

    var req = https.request(options, function (res) {
      console.log(res.statusCode);

      done();
    }).on('error', function (err) {
      console.log(err);

      done();
    });

    req.end(fs.readFileSync(__dirname + '/support/add.webid.ttl').toString());
  });
});