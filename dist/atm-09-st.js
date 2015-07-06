var toolkit = toolkit || {};
(function() {
  /**
   * namespace
   */
  toolkit.ns = (function() {
    var namespace = {};

    return function(name) {
      var dirs,
          currDir,
          node,
          i;

      dirs = name.split('.');
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

    clock.reset = function() {
      time = 0;
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

    utils.calculateAngle = function(basePos, targetPos) {
      var normalizedPoint = {
        x: targetPos.x - basePos.x,
        y: -(targetPos.y - basePos.y)
      };
      var degrees = 90 - Math.atan2(normalizedPoint.y, normalizedPoint.x) * 180 / Math.PI;
      degrees = Math.round(degrees);
      return degrees < 0 ? 360 + degrees : degrees;
    };

    utils.calculateCannonAngle = function(basePos, targetPos) {
      var normalizedPoint = {
        x: targetPos.x - basePos.x,
        y: -(targetPos.y - basePos.y)
      };
      var degrees = 180 - Math.atan2(normalizedPoint.y, normalizedPoint.x) * 180 / Math.PI;
      degrees = Math.round(degrees);
      return degrees === 360 ? 0 : degrees;
    };

    /**
     * return angle which is direction which move less distance
     * @param baseDegrees
     * @param targetDegrees move degrees
     */
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

    utils.splitDegrees = function(degrees, unit) {
      var result = [];
      for (var i = 0, count = Math.floor(degrees / unit); i < count; i++) {
        result.push(unit);
      }
      result.push(degrees % unit);
      return result;
    };

    /**
     * @param base base position
     * @param degrees move direction based on base
     * @param distance move distance based on base
     */
    utils.calculatePosition = function(base, degrees, distance) {
      //TODO degrees is convert fightcodenize
      var rad = utils.toRudian(degrees);
      return {
        x: base.x + Math.cos(rad) * distance,
        y: base.y + Math.sin(rad) * distance
      };
    };

    /**
     * convert angle into rudian
     * @param degrees angle degrees
     */
    utils.toRudian = function(degrees) {
      return Math.PI / 180 * degrees;
    };
  })(toolkit.ns('utils'));

  (function(logger) {
    var pattern = null;
    function isLogged_(message) {
      if (pattern && !pattern.test(message)) {
        return false;
      }
      return true;
    }

    function buildMessage_(messages) {
        var i, msg = [];
        for (i = 0; i < messages.length; i++) {
          if (typeof messages[i] === 'object') {
            msg.push(JSON.stringify(messages[i]));
          } else {
            msg.push(messages[i]);
          }
        }
        return msg.join(' ');
    }

    logger.get = function (context, robot) {
      var clock = toolkit.ns('clock');
      return function(_opts) {
        var message = clock.now() + ' ' + robot.id + ' [' + context + '] ' + buildMessage_(arguments);
        if (!isLogged_(message)) {
          return;
        }
        if (robot.log) {
          robot.log(message);
        } else {
          console.log(message);
        }
      };
    };

    logger.filter = function(ptn) {
      pattern = ptn;
    }
  })(toolkit.ns('logger'));

  /**
   * status
   */
  (function(status){
    function Status() {
      this.robotFound = false;
      this.idleCount = 0;
      this.direction = 1;
      this.turnDirection = 1;
      this.initialized = false;
    }
    Status.prototype.init = function(direction) {
      this.direction = direction;
      this.initialized = true;
    };
    Status.prototype.idle = function() {
      this.idleCount++;
      if (this.idleCount > 50) {
        this.robotFound = false;
      }
    };
    Status.prototype.encount = function() {
      this.idleCount = 0;
      this.robotFound = true;
    };

    var robots = {};
    status.get = function(id) {
      if (!robots[id]) {
        robots[id] = new Status();
      }
      return robots[id];
    };

    status.toString = function() {
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
    var robots = {};

    radar.mark = function(robot) {
      var clock = toolkit.ns('clock');
      var prev = robots[robot.id];
      robots[robot.id] = {
        robot: robot,
        updatedTime: clock.now()
      };
      if (prev && prev.updatedTime - clock.now() < 30) {
        robots[robot.id].prev = {
          robot: prev.robot,
          updatedTime: prev.updatedTime
        };
      }
      return robots[robot.id];
    };

    radar.getMarker = function(robot) {
      return robots[robot.id];
    };

    radar.unmark = function(robot) {
      delete robots[robot.id];
    };

    radar.reset = function() {
      robots = [];
    };

    radar.searchClosest = function(me) {
      var clock = toolkit.ns('clock');
      var utils = toolkit.ns('utils');
      var log = toolkit.getLogger('radar.searchClosest', me);
      var list = Object.keys(robots).filter(function(id) {
        var target = robots[id];
        return (clock.now() - target.updatedTime) <= 100;
      }).sort(function(t1, t2) {
        var mPos = me.position;
        var tPos1 = robots[t1].robot.position;
        var tPos2 = robots[t2].robot.position;
        var dx1 = Math.abs(mPos.x - tPos1.x);
        var dy1 = Math.abs(mPos.y - tPos1.y);
        var dx2 = Math.abs(mPos.x - tPos2.x);
        var dy2 = Math.abs(mPos.y - tPos2.y);
        if (dx1 < dx2 || dy1 < dy2) {
          return -1;
        } else {
          return 1;
        }
      });
      log(list);
      return list.length === 0 ? null : robots[list[0]];
    }

    radar.searchLeader = function(me) {
      var clock = toolkit.ns('clock');
      var utils = toolkit.ns('utils');
      var logger = toolkit.ns('logger');
      var log = toolkit.getLogger('radar.searchLeader', me);
      var list = Object.keys(robots).filter(function(id) {
        var target = robots[id];
        if (clock.now() - target.updatedTime <= 100) {
          if (target.robot.parentId === null) {
            return true;
          }
        }
        return false;
      });
      log(list);
      return list.lenght === 0 ? null : robots[list[0]];
    }

    radar.forecast = function(marker) {
      if (!marker.prev) {
        return marker.robot.position;
      }
      var prev = marker.prev;
      var robot = marker.robot;
      var prevRobot = prev.robot;
      var deltaTime = marker.updatedTime - prev.updatedTime;
      deltaTime = deltaTime === 0 ? 1 : deltaTime;
      var velocity = {
        x: (robot.position.x - prevRobot.position.x) / deltaTime,
        y: (robot.position.y - prevRobot.position.y) / deltaTime
      };
      return {
        x: robot.position.x + velocity.x,
        y: robot.position.y + velocity.y
      };
    };
  })(toolkit.ns('radar'));

  /**
   * command
   */
  (function(command) {
    command.trace = function(robot, dest) {
      var utils = toolkit.ns('utils');
      var log = toolkit.getLogger('command.trace', robot);
      var basePosition = robot.position;
      var degrees = utils.calclateAngle(basePosition, dest);
      log('c.x=' + basePosition.x + ',c.y=' + basePosition.y + ',angle=' + robot.angle);
      log('d.x=' + dest.x + ',d.y=' + dest.y);
      log('degrees=' + degrees);
      var length = Math.sqrt(Math.pow(basePosition.y - dest.y, 2) + Math.pow(basePosition.x - dest.x, 2));
      command.turnTo(robot, degrees);
      robot.ahead(length);
    };

    command.turnToDest = function(robot, dest, offset) {
      var utils = toolkit.ns('utils');
      var log = toolkit.getLogger('command.turnToDest', robot);
      offset = offset || 0;
      var mPos = robot.position;
      var degrees = utils.calculateAngle(mPos, dest);
      log('curr', mPos, 'dest', dest, 'degrees', degrees);
      command.turnTo(robot, degrees + offset);
    };

    command.turnTo = function(robot, degrees) {
      var utils = toolkit.ns('utils');
      var log = toolkit.getLogger('command.turnTo', robot);
      degrees = utils.deltaAngle(robot.angle, degrees);
      if (degrees !== 0) {
        log('before', robot.angle, 'delta', degrees);
        robot.turn(degrees);
        log('after', robot.angle);
      }
    };

    command.turnCannonToDest = function(robot, dest, offset) {
      var utils = toolkit.ns('utils');
      offset = offset || 0;
      var log = toolkit.getLogger('command.turnCannonToDest', robot);
      var mPos = robot.position;
      var degrees = utils.calculateAngle(mPos, dest);
      log('curr', mPos, 'dest', dest, 'degrees', degrees);
      command.turnTo(robot, degrees + offset);
      command.turnCannonTo(robot, degrees + offset);
    };

    command.turnCannonTo = function(robot, degrees) {
      var utils = toolkit.ns('utils');
      var log = toolkit.getLogger('command.turnCannonTo', robot);
      degrees = utils.deltaAngle(robot.cannonAbsoluteAngle, degrees);
      if (degrees !== 0) {
        log('before', robot.cannonAbsoluteAngle, 'delta', degrees);
        robot.rotateCannon(degrees);
        log('after', robot.cannonAbsoluteAngle);
      }
    };
  })(toolkit.ns('command'));

  // alias
  toolkit.getLogger = toolkit.ns('logger').get;
})();

//FightCode can only understand your robot
//if its class is called Robot
var Robot = function(robot) {
  toolkit.ns('logger').filter(/\[Robot/);
  robot.clone();
};

Robot.prototype.onIdle = function(ev) {
  // load toolkit
  var status = toolkit.ns('status'),
      clock = toolkit.ns('clock'),
      utils = toolkit.ns('utils'),
      radar = toolkit.ns('radar'),
      command = toolkit.ns('command');

  clock.tick();

  var log = toolkit.getLogger('Robot.onIdle', robot);
  var robot = ev.robot;
  var sts = status.get(robot.id);

  sts.idle();
  if (sts.robotFound) {
    return;
  }

  if (!sts.initialized) {
    utils.isClone(robot) ? sts.init(-1) : sts.init(1);
  }

  var target = radar.searchLeader(robot) || radar.searchClosest(robot);
  if (target) {
    robot.stop();
    var targetPos = target.robot.position;
    command.turnToDest(robot, targetPos, -robot.cannonRelativeAngle + 90);
  } else {
    robot.move(5 * sts.direction);
    robot.rotateCannon(30 * sts.direction);
  }
};

Robot.prototype.onScannedRobot = function(ev) {
  var status = toolkit.ns('status'),
      clock = toolkit.ns('clock'),
      utils = toolkit.ns('utils'),
      command = toolkit.ns('command'),
      radar = toolkit.ns('radar');

  clock.tick();

  var robot = ev.robot;
  var target = ev.scannedRobot;
  var log = toolkit.getLogger('Robot.onScannedRobot', robot);
  var sts = status.get(robot.id);

  if (utils.isBuddy(robot, target)) {
    robot.back(10);
    return;
  }

  sts.encount();
  radar.mark(target);
  robot.stop();

  for (var i = 0; i < 3; i++) {
    robot.fire();
  }
  log('ahead before', robot.position);
  robot.ahead(10);
  log('ahead after', robot.position);
  var dest = utils.calculatePosition(robot.position, robot.angle, 10);
  var angle = utils.calculateCannonAngle(dest, target.position);
  command.turnCannonTo(robot, angle);
  log('robot.position', robot.position, 'dest', dest, 'robot.cannonAbsoluteAngle', robot.cannonAbsoluteAngle, 'angle', angle);
  // var relativeAngle = utils.deltaAngle(robot.angle, robot.cannonAbsoluteAngle);
  // robot.turn(relativeAngle);
  // robot.rotateCannon(-relativeAngle);
  // var degrees = utils.splitDegrees(frontAngle, 10)[0];
  // robot.turn(degrees);
  // robot.rotateCannon(-degrees);
  // for (var i = 0; i < 10; i++) {
  //   robot.fire();
  //   //robot.move(5, (i % 2 === 0 ? 1 : -1));
  // }
  // utils.splitDegrees(relativeAngle, 10).forEach(function(degrees) {
  //   robot.fire();
  //   robot.turn(degrees);
  //   robot.rotateCannon(-degrees);
  // });
  // log('angle', robot.angle, 'cannonRelativeAngle', robot.cannonRelativeAngle, 'relativeAngle', relativeAngle);
};

Robot.prototype.onRobotCollision = function(ev) {
  var utils = toolkit.ns('utils'),
      clock = toolkit.ns('clock'),
      radar = toolkit.ns('radar'),
      command = toolkit.ns('command'),
      status = toolkit.ns('status');

  clock.tick();

  var robot = ev.robot;
  var sts = status.get(robot);
  var collidedRobot = ev.collidedRobot;

  var log = toolkit.getLogger('Robot.onRobotCollision', robot);

  if (!utils.isBuddy(robot, collidedRobot)) {
    sts.encout();
    radar.mark(collidedRobot);
  }

  // TODO if colliedRobot is buddy, get out. if not, turn to it.
  log('angle', robot.angle, 'bearing', ev.bearing);
  if ((ev.bearing <= 30 && ev.bearing >= 0) || (ev.bearing >= -30 && ev.bearing <= 0)) {
    robot.back(100);
  } else if ((ev.bearing >= 150 && ev.bearing <= 180) || (ev.bearing <= -150 && ev.bearing >= -180)) {
    robot.ahead(100);
  }
};

Robot.prototype.onHitByBullet = function(ev) {
  var clock = toolkit.ns('clock'),
      utils = toolkit.ns('utils'),
      command = toolkit.ns('command');

  clock.tick();

  var robot = ev.robot;
  var log = toolkit.getLogger('Robot.onHitByBullet', robot);

  if (robot.parentId === null && robot.life <= 40) {
    robot.disappear();
  }

  // TODO cannon turn to it.
  log('angle', robot.angle, 'bearing', ev.bearing);
  command.turnTo(robot, robot.angle + ev.bearing -robot.cannonRelativeAngle + 90);
};

Robot.prototype.onWallCollision = function(ev) {
  var robot = ev.robot;

  toolkit.ns('clock').tick();

  var log = toolkit.getLogger('Robot.onWallCollision', robot);

  log('angle', robot.angle, 'bearing', ev.bearing);
  robot.turn(90 + ev.bearing);
  robot.ahead(10);
};
