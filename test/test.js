var assert = require('assert');
var fs = require('fs');
var https = require('https');
var url = require('url');
//var request  = require('superagent');


describe('LdApp', function() {
	it('add webid', function(done) {
		var options = url.parse('https://localhost:8443/card');

		options.method = 'PATCH';
		options.headers = {"Content-Type": "text/turtle"};
		options.key = fs.readFileSync('/home/bergi/webid.key').toString();
		options.cert = fs.readFileSync('/home/bergi/webid.crt').toString();
		options.rejectUnauthorized = false;

		var req = https.request(options, function(res) {
			console.log(res.statusCode);
			done();
		}).on('error', function(err) {
			console.log(err);
			done();
		});

		req.end(fs.readFileSync(__dirname + '/support/add.webid.ttl').toString());
	});
});
