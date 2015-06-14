var assert = require('power-assert');

describe('utils.calculator', function() {
  var calculator = toolkit.ns('utils.calculator');
  describe('calculateAngle', function() {
    it('target position is top-right', function() {
      // target coordinate: x is plus, y is minus
      var base = {x: 10, y: 21.732};
      var target = {x: 11, y: 20};
      assert(calculator.calculateAngle(base, target) === 30);
    });

    it('target position is top-left', function() {
      // target coordinate: x is minus, y is minus
      var base = {x: 11, y: 21.732};
      var target = {x: 10, y: 20};
      assert(calculator.calculateAngle(base, target) === 330);
    });

    it('target position is top', function() {
      // target coordinate: x is 0, y is minus
      var base = {x: 10, y: 21.732};
      var target = {x: 10, y: 20};
      assert(calculator.calculateAngle(base, target) === 0);
    });
    
    it('target position is bottom', function() {
      // target coordinate: x is 0, y is plus
      var base = {x: 10, y: 20};
      var target = {x: 10, y: 21.732};
      assert(calculator.calculateAngle(base, target) === 180);
    });
    
    it('target position is right', function() {
      // target coordinate: x is plus, y is 0
      var base = {x: 10, y: 21.732};
      var target = {x: 11, y: 21.732};
      assert(calculator.calculateAngle(base, target) === 90);
    });

    it('target position is left', function() {
      // target coordinate: x is minus, y is 0
      var base = {x: 11, y: 21.732};
      var target = {x: 10, y: 21.732};
      assert(calculator.calculateAngle(base, target) === 270);
    });

    it('target position is bottom-right', function() {
      // target coordinate: x is plus, y is plus
      var base = {x: 10, y: 20};
      var target = {x: 11, y: 21.732};
      assert(calculator.calculateAngle(base, target) === 150);
    });

    it('target position is bottom-left', function() {
      // target coordinate: x is minus, y is plus
      var base = {x: 11, y: 20};
      var target = {x: 10, y: 21.732};
      assert(calculator.calculateAngle(base, target) === 210);
    });

    it('target position is bottom-left(45)', function() {
      // target coordinate: x is minus, y is plus
      var base = {x: 11, y: 20};
      var target = {x: 10, y: 21};
      assert(calculator.calculateAngle(base, target) === 225);
    });
  });

  describe('calculateCannonAngle', function() {
    it('target position is top-right', function() {
      // target coordinate: x is plus, y is minus
      var base = {x: 10, y: 21.732};
      var target = {x: 11, y: 20};
      assert(calculator.calculateCannonAngle(base, target) === 120);
    });

    it('target position is top-left', function() {
      // target coordinate: x is minus, y is minus
      var base = {x: 11, y: 21.732};
      var target = {x: 10, y: 20};
      assert(calculator.calculateCannonAngle(base, target) === 60);
    });

    it('target position is top', function() {
      // target coordinate: x is 0, y is minus
      var base = {x: 10, y: 21.732};
      var target = {x: 10, y: 20};
      assert(calculator.calculateCannonAngle(base, target) === 90);
    });
    
    it('target position is bottom', function() {
      // target coordinate: x is 0, y is plus
      var base = {x: 10, y: 20};
      var target = {x: 10, y: 21.732};
      assert(calculator.calculateCannonAngle(base, target) === 270);
    });
    
    it('target position is right', function() {
      // target coordinate: x is plus, y is 0
      var base = {x: 10, y: 21.732};
      var target = {x: 11, y: 21.732};
      assert(calculator.calculateCannonAngle(base, target) === 180);
    });

    it('target position is left', function() {
      // target coordinate: x is minus, y is 0
      var base = {x: 11, y: 21.732};
      var target = {x: 10, y: 21.732};
      assert(calculator.calculateCannonAngle(base, target) === 0);
    });

    it('target position is bottom-right', function() {
      // target coordinate: x is plus, y is plus
      var base = {x: 10, y: 20};
      var target = {x: 11, y: 21.732};
      assert(calculator.calculateCannonAngle(base, target) === 240);
    });

    it('target position is bottom-left', function() {
      // target coordinate: x is minus, y is plus
      var base = {x: 11, y: 20};
      var target = {x: 10, y: 21.732};
      assert(calculator.calculateCannonAngle(base, target) === 300);
    });

    it('target position is bottom-left(45)', function() {
      // target coordinate: x is minus, y is plus
      var base = {x: 11, y: 20};
      var target = {x: 10, y: 21};
      assert(calculator.calculateCannonAngle(base, target) === 315);
    });
  });

  describe('deltaDegrees', function() {
    it('target > base. and delta absolute value is less than 180', function() {
      assert(calculator.deltaAngle(10, 30) === 20);
    });

    it('target > base. and delta absolute value is more than 180', function() {
      assert(calculator.deltaAngle(10, 210) === -160);
    });

    it('target < base. and delta absolute value is less than 180', function() {
      assert(calculator.deltaAngle(120, 90) === -30);
    });

    it('target < base. and delta absolute value is more than 180', function() {
      assert(calculator.deltaAngle(210, 10) === 160);
    });
  });
});
