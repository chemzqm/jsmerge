var fs = require ('fs');
var path = require ('path');

function resolve(code) {
  var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g
  var SLASH_RE = /\\\\/g
  var ret = []
  code.replace(SLASH_RE, "")
      .replace(REQUIRE_RE, function(m, m1, m2) {
        if (m2) {
          ret.push(m2)
        }
      })
  return ret;
}

module.exports = function(src, dist) {
  var files = fs.readdirSync(src);
  var tmpl = fs.readFileSync(path.resolve(__dirname, 'template/tmpl.js'), 'utf8');
  var out = fs.createWriteStream(path.resolve(dist, 'build.js'), {
    encoding: 'utf8'
  });
  out.write('(function() {\n');
  out.write(tmpl);
  var deps = {};
  files.forEach(function(f) {
    if (/\.js$/.test(f)) {
      var id = f.replace(/\.js$/, '');
      var content = fs.readFileSync(path.resolve(src, f), 'utf8');
      deps[id] = resolve(content);
      out.write('define(\'' + id + '\', function(module, exports){\n');
      out.write(content);
      out.write('})\n');
    }
  })
  Object.keys(deps).forEach(function(id) {
    var arr = deps[id];
    out.write('dependency[\'' + id + '\'] = [');
    var str = arr.map(function(id) {
      return '\'' + id + '\'';
    }).join(', ');
    out.write(str);
    out.write(']\n');
  })
  out.write('run();})();');
  out.end();
}
