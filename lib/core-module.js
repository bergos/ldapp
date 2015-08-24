var
  express = require('express');


module.exports = function () {
  var config = this;

  config.app = express();
  config.app.use(express.cookieParser());
  config.app.use(express.session(config.session));

  return Promise.resolve();
};