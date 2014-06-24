var fs = require('fs');

var copy = function (source, target) {
  fs.writeFileSync(target, fs.readFileSync(source));
};

copy('node_modules/rdf-interfaces/rdfi.js', 'public/js/rdf.js');
copy('node_modules/rdf-ext/dist/rdf-ext.js', 'public/js/rdf-ext.js');
copy('node_modules/rdf-jsonify/rdf-jsonify.js', 'public/js/rdf-jsonify.js');