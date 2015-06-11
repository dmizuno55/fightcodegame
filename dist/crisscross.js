var toolkit = toolkit || {};
(function() {
  /**
   * namespace
   */
  toolkit.ns = (function() {
    var LIB_NAME = 'toolkit';
    var namespace = {};

    return function(name) {
      var dirs,
          currDir,
          node,
          i;

      dirs = name.split('.');
      if (dirs[0] === LIB_NAME) {
        dirs.shift();
      }

      currDir = namespace;
      for (i = 0; i < dirs.length; i++) {
        node = dirs[i];
        if (!currDir[node]) {
          currDir[node] = {};
        }
        currDir = currDir[node];
      }

      return currDir;
    };
  })();

  /**
   * clock
   */
  (function(clock) {
    var time = 0;
    clock.tick = function() {
      time++;
    };

    clock.now = function() {
      return time;
    };
  })(toolkit.ns('clock'));

  /**
   * utils
   */
  (function(utils) {
    utils.isClone = function(robot) {
      return robot.parentId !== null;
    };

    utils.isBuddy = function(me, other) {
      if (me.id === other.parentId || me.parentId === other.id) {
        return true;
      } else {
        return false;
      }
    };

    utils.logger = function(context, robot) {
      return function(message) {
        var msg = '[' + context + ']' + message;
        robot.log(msg);
      };
    };
  })(toolkit.ns('utils'));

  /**
   * status
   */
  (function(status){
    var robots = {};
    status.get = function(id) {
      if (!robots[id]) {
        robots[id] = {
          robotFound: false,
          idleCount: 0,
          direction: 1,
          turnDirection: 1,
          initialize: false
        };
      }
      return robots[id];
    };

    status.dump = function() {
      return JSON.stringify(robots);
    };

    status.clear = function() {
      robots = {};
    };
  })(toolkit.ns('status'));

  /**
   * radar
   */
  (function(radar) {
    var clock = toolkit.ns('clock');
    var utils = toolkit.ns('utils');
    var robots = {};

    radar.mark = function(robot) {
      robots[robot.id] = {robot: robot, time: clock.now()};
    };

    radar.reset = function(robot) {
      delete robots[robot.id];
    };

    radar.search = function(me) {
      var log = utils.logger('radar.search', me);
      var mPos = me.position;
      var e, ePos, enemy;
      var dx = me.arenaWidth; // farthest point
      var dy = me.arenaHeight; // farthest point
      var target;
      for (e in robots) {
        log('dx=' + dx + ',dy=' + dy);
        target = robots[e];
        if (clock.now() - target.time > 500) {
          continue;
        }
        ePos = target.robot.position;
        if (dx > Math.abs(mPos.x - ePos.x) || dy > Math.abs(mPos.y - ePos.y)) {
          dx = Math.abs(mPos.x - ePos.x);
          dy = Math.abs(mPos.y - ePos.y);
          enemy = target.robot;
        }
      }

      return enemy;
    };
  })(toolkit.ns('radar'));

  /**
   * tracker
   */
  (function(tracker) {
    var utils = toolkit.ns('utils');
    var robots = {};

    tracker.mark = function(robot) {
      robots[robot.id] = robot;
    };

    tracker.unmark = function(robot) {
      delete robots[robot.id];
    };

    tracker.search = function(me) {
      var log = utils.logger('tracker.search', me);
      var mPos = me.position;
      var e, ePos, enemy;
      var dx = me.arenaWidth - me.position.x < me.arenaWidth / 2 ? 0 : me.arenaWidth; // farthest point
      var dy = me.arenaHeight - me.position.y < me.arenaHeight / 2 ? 0 : me.arenaHeight; // farthest point
      var target;
      for (e in Object.keys(robots)) {
        log('dx=' + dx + ',dy=' + dy);
        target = Radar.robots[e];
        ePos = target.position;
        if (dx > Math.abs(mPos.x - ePos.x) || dy > Math.abs(mPos.y - ePos.y)) {
          dx = Math.abs(mPos.x - ePos.x);
          dy = Math.abs(mPos.y - ePos.y);
          enemy = target;
        }
      }
      return enemy;
    };
  })(toolkit.ns('tracker'));

  /**
   * command
   */
  (function(command) {
    var utils = toolkit.ns('utils');
    command.trace = function(me, target) {
      var log = utils.logger('command.trace', me);
      var mPos = me.position;
      var tPos = target.position;
      var dir = Math.atan2(Math.abs(tPos.y - mPos.y), Math.abs(tPos.x - mPos.x)) * 180 / Math.PI;
      var absoluteDir = dir > 0 ? 360 - dir : 360 + dir;
      Command.turnTo(me, absoluteDir);
      log('angle=' + me.angle);
    };

    command.go = function(robot, distance) {
      var log = utils.logger('command.go', robot);
      var curPos = robot.position;
      var dir = Math.atan2(Math.abs(distance.y - curPos.y), Math.abs(distance.x - curPos.x)) * 180 / Math.PI;
      log('c.x=' + curPos.x + ',c.y=' + curPos.y + ',angle=' + robot.angle);
      log('d.x=' + distance.x + ',d.y=' + distance.y);
      log('dir=' + dir);
      var length = Math.sqrt(Math.pow(curPos.y - distance.y, 2) + Math.pow(curPos.x - distance.x, 2));
      var absoluteDir = dir > 0 ? 360 - dir : 360 + dir;
      log('absoluteDir=' + absoluteDir);
      Command.turnTo(robot.turn(absoluteDir));
      robot.ahead(length);
    };

    command.turnTo = function(robot, degrees) {
      var log = utils.logger('command.turnTo', robot);
      log('before angle=' + robot.angle);
      if (robot.angle > degrees) {
        robot.turn(robot.angle - degrees);
      } else {
        robot.turn(degrees - robot.angle);
      }
      log('after angle=' + robot.angle);
    };
  })(toolkit.ns('command'));
})();

var Robot = function(robot) {
  this.direction = 1;
};

Robot.prototype.onIdle = function(ev) {
  var command = toolkit.ns('command');
  var robot = ev.robot;
  if (robot.cannonRelativeAngle !== 180) {
    robot.rotateCannon(90);
  }

  command.turnTo(robot, 90);
};

Robot.prototype.onScannedRobot = function(ev) {
  var robot = ev.robot;
  var i;
  for (i = 0; i < 5; i++) {
    robot.fire();
  }
};

Robot.prototype.onWallCollision = function(ev) {
  var utils = toolkit.ns('utils');
  var robot = ev.robot;
  if (utils.isClone(robot)) {
    if (robot.angle === 0 || robot.angle === 180) {
      robot.turn(ev.bearing);
      robot.move(robot.arenaHeight, this.direction);
      this.direction = this.direction * -1;
    } else {
      robot.turn(90 + ev.bearing);
    }
  } else {
    if (robot.angle === 90 || robot.angle === 270) {
      robot.turn(ev.bearing);
      robot.move(robot.arenaWidth, this.direction);
      this.direction = this.direction * -1;
    } else {
      robot.turn(90 + ev.bearing);
    }
  }
};

Robot.prototype.onHitByBullet = function(ev) {
  var robot = ev.robot;
  robot.turn(ev.bearing);
};
