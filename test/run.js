/*global describe,it,before*/
var assert = require('assert');
var fs = require('fs');
var co = require('co');
var exec = require('co-exec');
var jsmerge = require('..');

before(function () {
  var target = __dirname + '/build/build.js';
  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
  }
})

function unlink(file) {
  return function (done) {
    fs.unlink(file, done);
  }
}

function exists(file) {
  return function (done) {
    fs.exists(file, function (exists) {
      done(null, exists);
    })
  }
}

describe('jsmerge', function() {
  it('should works', function(done) {
    var src = __dirname + '/src';
    var dist = __dirname + '/build';
    co(function* () {
      var exist = yield exists(dist + '/build.js');
      if (exist) {
        yield unlink(dist + '/build.js');
      }
      jsmerge(src, dist);
      var res = yield exec('node build.js', { cwd: dist });
      assert.deepEqual(res.split('\n'), ['a', 'b', 'c', 'd', '']);
    })(done);
  })
})

