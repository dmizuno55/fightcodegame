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
    function Status() {
      this.robotFound = false;
      this.idleCount = 0;
      this.direction = 1;
      this.turnDirection = 1;
      this.initialize = false;
    }
    Status.prototype.init = function(direction) {
      this.direction = direction;
      this.initialize = true;
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
    var clock = toolkit.ns('clock');
    var utils = toolkit.ns('utils');
    var robots = {};

    radar.mark = function(robot) {
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
    };

    radar.reset = function(robot) {
      delete robots[robot.id];
    };

    radar.search = function(me) {
      var log = utils.logger('radar.search', me);
      var dx = me.arenaWidth; // farthest point
      var dy = me.arenaHeight; // farthest point
      var mPos = me.position;
      var searchedMarker = null;
      Object.keys(robots).forEach(function(id) {
        var target = robots[id];
        var tPos = target.robot.position;
        if (clock.now() - target.updatedTime > 100) {
          return;
        }
        if (dx > Math.abs(mPos.x - tPos.x) || dy > Math.abs(mPos.y - tPos.y)) {
          dx = Math.abs(mPos.x - tPos.x);
          dy = Math.abs(mPos.y - tPos.y);
          searchedMarker = target;
        }
      });
      log(searchedMarker, clock.now());

      return searchedMarker;
    };

    radar.forecastPosition = function(marker) {
      if (!marker.prev) {
        return marker.robot.position;
      }
      var prev = marker.prev;
      var robot = marker.robot;
      var prevRobot = prev.robot;
      var deltaTime = marker.updatedTime - prev.updatedTime;
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
    var utils = toolkit.ns('utils');
    command.trace = function(robot, dest) {
      var log = utils.logger('command.trace', robot);
      var basePosition = robot.position;
      var degrees = utils.caluclateAngle(basePosition, dest);
      log('c.x=' + basePosition.x + ',c.y=' + basePosition.y + ',angle=' + robot.angle);
      log('d.x=' + dest.x + ',d.y=' + dest.y);
      log('degrees=' + degrees);
      var length = Math.sqrt(Math.pow(basePosition.y - dest.y, 2) + Math.pow(basePosition.x - dest.x, 2));
      command.turnTo(robot, degrees);
      robot.ahead(length);
    };

    command.turnToDest = function(robot, dest) {
      var log = utils.logger('command.turnToDest', robot);
      var mPos = robot.position;
      log('dest', dest);
      var degrees = utils.calculateAngle(mPos, dest);
      command.turnTo(robot, degrees);
    };

    command.turnTo = function(robot, degrees) {
      var log = utils.logger('command.turnTo', robot);
      degrees = utils.deltaAngle(robot.angle, degrees);
      log('before', 'angle=' + robot.angle, 'delta=' + degrees);
      robot.turn(utils.deltaAngle(degrees));
      log('after', 'angle=' + robot.angle);
    };

    command.turnCannonToDest = function(robot, dest) {
      var log = utils.logger('command.turnCannonToDest', robot);
      var mPos = robot.position;
      log('dest', dest);
      var degrees = utils.calculateAngle(mPos, dest);
      command.turnCannonTo(robot, degrees);
    };

    command.turnCannonTo = function(robot, degrees) {
      var log = utils.logger('command.turnCannonTo', robot);
      degrees = utils.deltaAngle(robot.cannonAbsoluteAngle, degrees);
      log('before', 'angle=' + robot.cannonAbsoluteAngle, 'delta=' + degrees);
      robot.rotateCannon(utils.deltaAngle(degrees));
      log('after', 'angle=' + robot.cannonAbsoluteAngle);
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
