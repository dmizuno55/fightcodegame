var assert = require('power-assert');

describe('radar', function() {
  var radar = toolkit.ns('radar');
  var clock = toolkit.ns('clock');
  function createRobot(id, parentId, pos) {
    var robot = {
      id: id,
      parentId: parentId,
      position: pos
    };
    return robot;
  }
  function getMe(pos) {
    var robot = createRobot('getMe', null, pos);
    robot.arenaWidth = 395;
    robot.arenaHeight = 480;
    robot.log = function() {};
    return robot;
  }
  function getBoss(pos) {
    return createRobot('enemy1', null, pos);
  }
  function getHenchman(pos) {
    return createRobot('enemy2', 'enemy1', pos);
  }

  describe('searchClosest', function() {
    beforeEach(function() {
      radar.reset();
      clock.reset();
    });

    it('marked 1 enemy', function() {
      var boss = getBoss({x: 10, y: 10});
      radar.mark(boss);
      var target = radar.searchClosest(getMe({x: 1, y: 1}));
      assert.deepEqual(target.robot, boss);
    });

    it('marked 1 enemy, but expired marker', function() {
      var boss = getBoss({x: 10, y: 10});
      radar.mark(boss);

      for (var i = 0; i < 101; i++) {
        clock.tick();
      }

      var target = radar.searchClosest(getMe({x: 1, y: 1}));
      assert.deepEqual(target, null);
    });

    it('marked 2 enemy', function() {
      var boss = getBoss({x: 10, y: 10});
      var henchman = getHenchman({x: 8, y: 10});
      radar.mark(boss);
      radar.mark(henchman);

      var target = radar.searchClosest(getMe({x: 1, y: 1}));
      assert.deepEqual(target.robot, henchman);
    });
  });

  describe('searchLeader', function() {
    beforeEach(function() {
      radar.reset();
      clock.reset();
    });

    it('1 enemy is marked. it is boss', function() {
      var boss = getBoss({x: 10, y: 10});
      radar.mark(boss);
      var target = radar.searchLeader(getMe({x: 1, y: 1}));
      assert.deepEqual(target.robot, boss);
    });

    it('1 enemy is marked. it is henchman', function() {
      var henchman = getHenchman({x: 10, y: 10});
      radar.mark(henchman);
      var target = radar.searchLeader(getMe({x: 1, y: 1}));
      assert.deepEqual(target, null);
    });

    it('marked 1 enemy, but expired marker', function() {
      var boss = getBoss({x: 10, y: 10});
      radar.mark(boss);

      var clock = toolkit.ns('clock');
      for (var i = 0; i < 101; i++) {
        clock.tick();
      }

      var target = radar.searchLeader(getMe({x: 1, y: 1}));
      assert.deepEqual(target, null);
    });

    it('marked 2 enemy', function() {
      var boss = getBoss({x: 10, y: 10});
      var henchman = getHenchman({x: 8, y: 10});
      radar.mark(boss);
      radar.mark(henchman);

      var target = radar.searchLeader(getMe({x: 1, y: 1}));
      assert.deepEqual(target.robot, boss);
    });
  });
});
