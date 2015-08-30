var antjs = require('antjs')
var fs = require('fs')

var loadConfig = function () {
  if (fs.existsSync('./config.js')) {
    return require('./config')
  } else {
    return require('./config.default')
  }
}

var config = loadConfig()

antjs.load(config.modules, config)
  .catch(function (error) {
    console.error(error.stack || error.message)
  })
