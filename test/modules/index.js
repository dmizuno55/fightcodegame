var assert = require('power-assert');

describe('index', function() {
  describe('ns', function() {
    before(function() {
      var fuga = toolkit.ns('toolkit.hoge.fuga');
      fuga.value = 1;
    });

    it('input toolkit.hoge.fuga', function() {
      var fuga = toolkit.ns('toolkit.hoge.fuga');
      assert.deepEqual(fuga, {value: 1});
    });

    it('input hoge.fuga', function() {
      var fuga = toolkit.ns('hoge.fuga');
      assert.deepEqual(fuga, {value: 1});
    });
  });
});
