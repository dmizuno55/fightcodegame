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

  describe('splitDegrees', function() {
    it('exists surplus', function() {
      assert.deepEqual(utils.splitDegrees(100, 40), [40, 40, 20]);
    });
    it('not exists surplus', function() {
      assert.deepEqual(utils.splitDegrees(90, 30), [30, 30, 30, 0]);
    });
    it('only surplus', function() {
      assert.deepEqual(utils.splitDegrees(10, 30), [10]);
    });
    it('negative number', function() {
      assert.deepEqual(utils.splitDegrees(-100, 40), [-40, -40, -20]);
    });
  });

  describe('calculatePosition', function() {
    it('degress 30', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 30, 2);
      assert(Math.round(result.x) === 2);
      assert(Math.round(result.y) === 1);
    });
    it('degress 60', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 60, 2);
      assert(Math.round(result.x) === 1);
      assert(Math.round(result.y) === 2);
    });
    it('degress 90', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 90, 2);
      assert(Math.round(result.x) === 0);
      assert(Math.round(result.y) === 2);
    });
    it('degress 120', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 120, 2);
      assert(Math.round(result.x) === -1);
      assert(Math.round(result.y) === 2);
    });
    it('degress 150', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 150, 2);
      assert(Math.round(result.x) === -2);
      assert(Math.round(result.y) === 1);
    });
    it('degress 180', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 180, 2);
      assert(Math.round(result.x) === -2);
      assert(Math.round(result.y) === 0);
    });
    it('degress 210', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 210, 2);
      assert(Math.round(result.x) === -2);
      assert(Math.round(result.y) === -1);
    });
    it('degress 240', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 240, 2);
      assert(Math.round(result.x) === -1);
      assert(Math.round(result.y) === -2);
    });
    it('degress 270', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 270, 2);
      assert(Math.round(result.x) === 0);
      assert(Math.round(result.y) === -2);
    });
    it('degress 300', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 300, 2);
      assert(Math.round(result.x) === 1);
      assert(Math.round(result.y) === -2);
    });
    it('degress 330', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 330, 2);
      assert(Math.round(result.x) === 2);
      assert(Math.round(result.y) === -1);
    });
    it('degress 360', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 360, 2);
      assert(Math.round(result.x) === 2);
      assert(Math.round(result.y) === 0);
    });
    it('degress 0', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 0, 2);
      assert(Math.round(result.x) === 2);
      assert(Math.round(result.y) === 0);
    });
    it('degress 30. distance is negative value', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 30, -2);
      assert(Math.round(result.x) === -2);
      assert(Math.round(result.y) === -1);
    });
    it('degress 60. distance is negative value', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 60, -2);
      assert(Math.round(result.x) === -1);
      assert(Math.round(result.y) === -2);
    });
    it('degress 90. distance is negative value', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 90, -2);
      assert(Math.round(result.x) === 0);
      assert(Math.round(result.y) === -2);
    });
    it('degress 120. distance is negative value', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 120, -2);
      assert(Math.round(result.x) === 1);
      assert(Math.round(result.y) === -2);
    });
    it('degress 150. distance is negative value', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 150, -2);
      assert(Math.round(result.x) === 2);
      assert(Math.round(result.y) === -1);
    });
    it('degress 180. distance is negative value', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 180, -2);
      assert(Math.round(result.x) === 2);
      assert(Math.round(result.y) === 0);
    });
    it('degress 210. distance is negative value', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 210, -2);
      assert(Math.round(result.x) === 2);
      assert(Math.round(result.y) === 1);
    });
    it('degress 240. distance is negative value', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 240, -2);
      assert(Math.round(result.x) === 1);
      assert(Math.round(result.y) === 2);
    });
    it('degress 270. distance is negative value', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 270, -2);
      assert(Math.round(result.x) === 0);
      assert(Math.round(result.y) === 2);
    });
    it('degress 300. distance is negative value', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 300, -2);
      assert(Math.round(result.x) === -1);
      assert(Math.round(result.y) === 2);
    });
    it('degress 330. distance is negative value', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 330, -2);
      assert(Math.round(result.x) === -2);
      assert(Math.round(result.y) === 1);
    });
    it('degress 360. distance is negative value', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 360, -2);
      assert(Math.round(result.x) === -2);
      assert(Math.round(result.y) === 0);
    });
    it('degress 0. distance is negative value', function() {
      var base = {x: 0, y: 0};
      var result = utils.calculatePosition(base, 0, -2);
      assert(Math.round(result.x) === -2);
      assert(Math.round(result.y) === 0);
    });
  });

  describe('inFuzzyAngle', function() {
    it('larger value in range', function() {
      assert(utils.inFuzzyAngle(190, 180, 10));
    });
    it('less value in range', function() {
      assert(utils.inFuzzyAngle(170, 180, 10));
    });
    it('equal value', function() {
      assert(utils.inFuzzyAngle(180, 180, 10));
    });
    it('larger value out of range', function() {
      assert(!utils.inFuzzyAngle(200, 180, 10));
    });
    it('less value out of range', function() {
      assert(!utils.inFuzzyAngle(160, 180, 10));
    });
    it('larger value in range. accuracy is omitted', function() {
      assert(utils.inFuzzyAngle(189, 180, 10));
    });
    it('less value in range. accuracy is omitted', function() {
      assert(utils.inFuzzyAngle(175, 180));
    });
    it('lower baseline is less than 0. and the value in range', function() {
      assert(utils.inFuzzyAngle(350, 0));
      assert(utils.inFuzzyAngle(10, 0));
    });
    it('lower baseline is less than 0. and the value out of range', function() {
      assert(!utils.inFuzzyAngle(340, 0));
      assert(!utils.inFuzzyAngle(20, 0));
    });
  });
});
