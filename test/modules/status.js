var assert = require('power-assert');

describe('status', function() {
  var status = toolkit.ns('status');
  beforeEach(function() {
    var sts = status.get('hoge');
    sts.encount();
  });
  afterEach(function() {
    status.clear();
  });

  it('get hoge status', function() {
    var sts = status.get('hoge');
    assert(sts.robotFound === true);
  });

  it('get fuga status', function() {
    var sts = status.get('fuga');
    assert(sts.robotFound === false);
  });

  it('dump status', function() {
    var dump = status.toString();
    assert.deepEqual(dump, '{"hoge":{"robotFound":true,"idleCount":0,"direction":1,"turnDirection":1,"initialized":false}}');
  });
});
