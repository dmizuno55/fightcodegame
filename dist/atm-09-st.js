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

    utils.logger = function (context, robot) {
      return function(message) {
        var i, msg = [];
        for (i = 0; i < arguments.length; i++) {
          if (typeof arguments[i] === 'object') {
            msg.push(JSON.stringify(arguments[i]));
          } else {
            msg.push(arguments[i]);
          }
        }
        robot.log('[' + context + '] ' + msg.join(' '));
      };
    };

    utils.calculateAngle = function(basePoint, targetPoint) {
      var normalizedPoint = {
        x: targetPoint.x - basePoint.x,
        y: -(targetPoint.y - basePoint.y)
      };
      var degrees = 90 - Math.atan2(normalizedPoint.y, normalizedPoint.x) * 180 / Math.PI;
      degrees = Math.round(degrees);
      return degrees < 0 ? 360 + degrees : degrees;
    };
    
    utils.deltaAngle = function(baseDegrees, targetDegrees) {
      var deltaDegrees = targetDegrees - baseDegrees;
      if (Math.abs(deltaDegrees) > 180) {
        if (deltaDegrees > 0) {
          deltaDegrees = deltaDegrees - 360;
        } else {
          deltaDegrees = deltaDegrees + 360;
        }
      }
      return deltaDegrees;
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
        target = robots[e];
        if (clock.now() - target.time > 50) {
          continue;
        }
        ePos = target.robot.position;
        if (dx > Math.abs(mPos.x - ePos.x) || dy > Math.abs(mPos.y - ePos.y)) {
          dx = Math.abs(mPos.x - ePos.x);
          dy = Math.abs(mPos.y - ePos.y);
          enemy = target.robot;
        }
      }
      log(enemy);

      return enemy;
    };
  })(toolkit.ns('radar'));

  /**
   * command
   */
  (function(command) {
    var utils = toolkit.ns('utils');
    command.trace = function(me, target) {
      var log = utils.logger('command.trace', me);
      var mPos = me.position;
      var tPos = target.position;
      var degrees = utils.caluclateAngle(mPos, tPos);
      command.turnTo(me, degrees);
      log('angle=' + me.angle);
    };

    command.go = function(robot, distance) {
      var log = utils.logger('command.go', robot);
      var basePosition = robot.position;
      var degrees = utils.caluclateAngle(basePosition, distance);
      log('c.x=' + basePosition.x + ',c.y=' + basePosition.y + ',angle=' + robot.angle);
      log('d.x=' + distance.x + ',d.y=' + distance.y);
      log('degrees=' + degrees);
      var length = Math.sqrt(Math.pow(basePosition.y - distance.y, 2) + Math.pow(basePosition.x - distance.x, 2));
      command.turnTo(robot, degrees);
      robot.ahead(length);
    };

    command.turnTo = function(robot, degrees) {
      var log = utils.logger('command.turnTo', robot);
      log('before angle=' + robot.angle);
      robot.turn(utils.deltaAngle(degrees));
      log('after angle=' + robot.angle);
    };
  })(toolkit.ns('command'));
})();

//FightCode can only understand your robot
//if its class is called Robot
var Robot = function(robot) {
  robot.clone();
};

Robot.prototype.onIdle = function(ev) {
  // load toolkitk
  toolkit.ns('clock').tick();
  var status = toolkit.ns('status'),
      utils = toolkit.ns('utils'),
      radar = toolkit.ns('radar'),
      command = toolkit.ns('command');

  var robot = ev.robot;
  var sts = status.get(robot.id);
  var log = utils.logger('Robot.onIdle', robot);

  sts.idleCount++;
  if (sts.idleCount > 50) {
    sts.robotFound = false;
  }

  if (robot.cannonRelativeAngle !== 180) {
    robot.rotateCannon(180 - robot.cannonRelativeAngle);
    if (utils.isClone(robot)) {
      sts.direction = -1;
    } else {
      sts.direction = 1;
    }
  }

  if (!sts.robotFound) {
    var target = radar.search(robot);
    if (target) {
      command.trace(robot, target);
    } else {
      robot.move(10, sts.direction);
      robot.turn(1 * (sts.idleCount % 50));
    }
  }
//  log('Status=' + status.dump());
};

Robot.prototype.onScannedRobot = function(ev) {
  var status = toolkit.ns('status'),
      clock = toolkit.ns('clock'),
      utils = toolkit.ns('utils'),
      radar = toolkit.ns('radar');

  var robot = ev.robot;
  var target = ev.scannedRobot;
  var log = utils.logger('Robot.onScannedRobot', robot);
  var sts = status.get(robot.id);

  if (utils.isBuddy(robot, target)) {
    return;
  }

  sts.robotFound = true;
  sts.idleCount = 0;

  log(target.id, clock.now());
  radar.mark(target);

  var i, dir, slide;
  for (i = 0; i < 5; i++) {
    if (i % 2 === 0) {
      dir = 1;
      slide = 1
    } else {
      dir = -1;
      slide = 0;
    }
    robot.fire();
    robot.move(5 + slide, dir);
    if (slide > 0) {
      robot.rotateCannon(slide);
    }
  }
};

Robot.prototype.onRobotCollision = function(ev) {
  var utils = toolkit.ns('utils');

  var robot = ev.robot;
  var log = utils.logger('Robot.onRobotCollision', robot);

  log('bearing=' + ev.bearing);
  if ((ev.bearing <= 30 && ev.bearing >= 0) || (ev.bearing >= -30 && ev.bearing <= 0)) {
    robot.back(100);
  } else if ((ev.bearing >= 150 && ev.bearing <= 180) || (ev.bearing <= -150 && ev.bearing >= -180)) {
    robot.ahead(100);
  }
  robot.turn(ev.bearing - 90);
};

Robot.prototype.onHitByBullet = function(ev) {
  var utils = toolkit.ns('utils');

  var robot = ev.robot;
  var log = utils.logger('Robot.onHitByBullet', robot);

  log('bearing=' + ev.bearing);
  robot.turn(ev.bearing - 90);
};

Robot.prototype.onWallCollision = function(ev) {
  var robot = ev.robot;
  robot.turn(90 + ev.bearing);
};
