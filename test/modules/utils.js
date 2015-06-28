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

  describe('calculateAngle', function() {
    it('target position is top-right', function() {
      // target coordinate: x is plus, y is minus
      var base = {x: 10, y: 21.732};
      var target = {x: 11, y: 20};
      assert(utils.calculateAngle(base, target) === 30);
    });

    it('target position is top-left', function() {
      // target coordinate: x is minus, y is minus
      var base = {x: 11, y: 21.732};
      var target = {x: 10, y: 20};
      assert(utils.calculateAngle(base, target) === 330);
    });

    it('target position is top', function() {
      // target coordinate: x is 0, y is minus
      var base = {x: 10, y: 21.732};
      var target = {x: 10, y: 20};
      assert(utils.calculateAngle(base, target) === 0);
    });

    it('target position is bottom', function() {
      // target coordinate: x is 0, y is plus
      var base = {x: 10, y: 20};
      var target = {x: 10, y: 21.732};
      assert(utils.calculateAngle(base, target) === 180);
    });

    it('target position is right', function() {
      // target coordinate: x is plus, y is 0
      var base = {x: 10, y: 21.732};
      var target = {x: 11, y: 21.732};
      assert(utils.calculateAngle(base, target) === 90);
    });

    it('target position is left', function() {
      // target coordinate: x is minus, y is 0
      var base = {x: 11, y: 21.732};
      var target = {x: 10, y: 21.732};
      assert(utils.calculateAngle(base, target) === 270);
    });

    it('target position is bottom-right', function() {
      // target coordinate: x is plus, y is plus
      var base = {x: 10, y: 20};
      var target = {x: 11, y: 21.732};
      assert(utils.calculateAngle(base, target) === 150);
    });

    it('target position is bottom-left', function() {
      // target coordinate: x is minus, y is plus
      var base = {x: 11, y: 20};
      var target = {x: 10, y: 21.732};
      assert(utils.calculateAngle(base, target) === 210);
    });

    it('target position is bottom-left(45)', function() {
      // target coordinate: x is minus, y is plus
      var base = {x: 11, y: 20};
      var target = {x: 10, y: 21};
      assert(utils.calculateAngle(base, target) === 225);
    });
  });

  describe('calculateCannonAngle', function() {
    it('target position is top-right', function() {
      // target coordinate: x is plus, y is minus
      var base = {x: 10, y: 21.732};
      var target = {x: 11, y: 20};
      assert(utils.calculateCannonAngle(base, target) === 120);
    });

    it('target position is top-left', function() {
      // target coordinate: x is minus, y is minus
      var base = {x: 11, y: 21.732};
      var target = {x: 10, y: 20};
      assert(utils.calculateCannonAngle(base, target) === 60);
    });

    it('target position is top', function() {
      // target coordinate: x is 0, y is minus
      var base = {x: 10, y: 21.732};
      var target = {x: 10, y: 20};
      assert(utils.calculateCannonAngle(base, target) === 90);
    });

    it('target position is bottom', function() {
      // target coordinate: x is 0, y is plus
      var base = {x: 10, y: 20};
      var target = {x: 10, y: 21.732};
      assert(utils.calculateCannonAngle(base, target) === 270);
    });

    it('target position is right', function() {
      // target coordinate: x is plus, y is 0
      var base = {x: 10, y: 21.732};
      var target = {x: 11, y: 21.732};
      assert(utils.calculateCannonAngle(base, target) === 180);
    });

    it('target position is left', function() {
      // target coordinate: x is minus, y is 0
      var base = {x: 11, y: 21.732};
      var target = {x: 10, y: 21.732};
      assert(utils.calculateCannonAngle(base, target) === 0);
    });

    it('target position is bottom-right', function() {
      // target coordinate: x is plus, y is plus
      var base = {x: 10, y: 20};
      var target = {x: 11, y: 21.732};
      assert(utils.calculateCannonAngle(base, target) === 240);
    });

    it('target position is bottom-left', function() {
      // target coordinate: x is minus, y is plus
      var base = {x: 11, y: 20};
      var target = {x: 10, y: 21.732};
      assert(utils.calculateCannonAngle(base, target) === 300);
    });

    it('target position is bottom-left(45)', function() {
      // target coordinate: x is minus, y is plus
      var base = {x: 11, y: 20};
      var target = {x: 10, y: 21};
      assert(utils.calculateCannonAngle(base, target) === 315);
    });
  });

  describe('deltaDegrees', function() {
    it('target > base. and delta absolute value is less than 180', function() {
      assert(utils.deltaAngle(10, 30) === 20);
    });

    it('target > base. and delta absolute value is more than 180', function() {
      assert(utils.deltaAngle(10, 210) === -160);
    });

    it('target < base. and delta absolute value is less than 180', function() {
      assert(utils.deltaAngle(120, 90) === -30);
    });

    it('target < base. and delta absolute value is more than 180', function() {
      assert(utils.deltaAngle(210, 10) === 160);
    });
  });
});
