var assert = require('power-assert');

describe('utils', function() {
  var utils = toolkit.ns('utils');
  describe('isClone', function() {

    it('robot is not clone', function() {
      var robot = {
        parentId: null
      };
      assert(utils.isClone(robot) === false);
    });

    it('robot is clone', function() {
      var robot = {
        parentId: 12345
      };
      assert(utils.isClone(robot) === true);
    });
  });

  describe('isBuddy', function() {
    it('me is original, other is clone', function() {
      var me = {id: 12345, parentId: null};
      var other = {parentId: 12345, id: 12346};
      assert(utils.isBuddy(me, other) === true);
    });

    it('me is clone, other is original', function() {
      var me = {parentId: 12345, id: 12346};
      var other = {id: 12345, parentId: null};
      assert(utils.isBuddy(me, other) === true);
    });

    it('me and other is not buddy', function() {
      var me = {parentId: 12345, id: 12346};
      var other = {id: 22345, parentId: null};
      assert(utils.isBuddy(me, other) === false);
    });
  });

  describe('logger', function() {
    var robot;
    before(function() {
      robot = {};
      robot.log = function(message) {
        console.log(message);
        assert.ok(message);
      };
    });

    it('output log', function() {
      var log = utils.logger('context', robot);
      log('hoge', {name: 'hoge', age: 20});
    });
  });

});
