var assert = require('power-assert');

describe('logger', function() {
  var robot;
  before(function() {
    robot = {
      id: 'element1'
    };
    robot.log = function(message) {
      console.log(message);
      assert.ok(message);
    };
  });

  it('output log', function() {
    var log = toolkit.getLogger('context', robot);
    log('hoge', {name: 'hoge', age: 20});
  });

  it('filter passed log', function() {
    toolkit.ns('logger').filter(/hoge/);

    var result = false;
    var r = {
      log: function(message) {
        result = true;
      }
    };
    
    var log = toolkit.getLogger('context', r);
    log('hoge', {name: 'hoge', age: 20});
    assert(result, 'must be called.');
  });

  it('filter no passed log', function() {
    toolkit.ns('logger').filter(/fuga/);

    var result = true;
    var r = {
      log: function(message) {
        result = false;
      }
    };

    var log = toolkit.getLogger('context', r);
    log('hoge', {name: 'hoge', age: 20});
    assert(result, 'must not be called.');
  });
});
