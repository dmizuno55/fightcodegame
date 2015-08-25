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

  afterEach(function() {
    toolkit.ns('logger').setLevel('INFO');
  });

  it('output log', function() {
    var log = toolkit.getLogger('context', robot);
    log.info('hoge', {name: 'hoge', age: 20});
    toolkit.ns('logger').flush();
  });

  it('call leveling log lower than setting level', function() {
    toolkit.ns('logger').setLevel('INFO');

    var called = false;
    var r = {
      log: function(message) {
        called = true;
      }
    };

    var log = toolkit.getLogger('context');
    log.debug('hoge', {name: 'hoge', age: 20});
    toolkit.ns('logger').flush(r);
    assert(!called, 'must not be called.');
  });

  it('call leveling log higher than setting level', function() {
    toolkit.ns('logger').setLevel('INFO');

    var called = false;
    var r = {
      log: function(message) {
        called = true;
      }
    };

    var log = toolkit.getLogger('context');
    log.warn('hoge', {name: 'hoge', age: 20});
    toolkit.ns('logger').flush(r);
    assert(called, 'must be called.');
  });
});
