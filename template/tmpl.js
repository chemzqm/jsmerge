var modules = {};
var dependency = {};
var require = function(name) {
  return modules[name];
}

var factories = {};
var mods = [];

var define = function(id, fn) {
  mods.push(id);
  factories[id] = function() {
    var module = {};
    module.exports = {};
    fn(module, module.exports);
    modules[id] = module.exports;
  }
}

/**
 * check if all element in a is in b
 * @param {String} a
 * @param {String} b
 * @api public
 */
function within(a, b) {
  for (var i = 0; i < a.length; i++) {
    if (b.indexOf(a[i]) === -1) return false;
  }
  return true;
}

function run() {
  var called = [];
  var l = mods.length;
  while (l > 0) {
    var j = l;
    for (var i = 0; i < l; i++) {
      var id = mods[i];
      var deps = dependency[id];
      if (within(deps, called)) {
        factories[id].call(null);
        called.push(id);
        mods.splice(i, 1);
        l = l - 1;
      }
    }
    if (j !== 0 && j === l) throw new Error('circle dependency');
  }
}
