var assert = require('power-assert');

describe('status', function() {
  var status = toolkit.ns('status');
  before(function() {
    var sts = status.get('hoge');
    sts.robotFound = true;
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
  });
});
