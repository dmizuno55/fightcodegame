// TODO ES6 coding style
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

  (function(proxy) {
    proxy.applyDefaultProxy = function(handlers, event) {
      var originalHandler = handlers[event];
      return function(ev) {
        // tick time
        toolkit.tick();

        var log = toolkit.getLogger('Robot.' + event);

        // log start
        log.debug('start');

        // call original handler
        try {
          originalHandler.apply(handlers, [ev]);
        } catch (e) {
          var errMsg = e.stack ? e.stack : e;
          log.error('catch error:', errMsg);
        }

        // log end
        log.debug('end');

        // flush log
        toolkit.ns('logger').flush(ev.robot);
      }
    };

    proxy.setup = function(handlers) {
      var event;
      for (event in handlers) {
        handlers[event] = proxy.applyDefaultProxy(handlers, event);
      }
    };
  })(toolkit.ns('proxy'));

  /**
   * clock
   */
  (function(clock) {
    var time = 0;
    clock.tick = function() {
      time++;
      toolkit.ns('clock.event').emit(time);
    };

    clock.now = function() {
      return time;
    };

    clock.reset = function() {
      time = 0;
    };
  })(toolkit.ns('clock'));

  (function(event) {
    var sequence = 0;
    var handlers = {};

    event.on = function(handler) {
      var id = 'event' + sequence++;
      handlers[id] = handler;
    };

    event.off = function(id) {
      delete handlers[id];
    }

    event.emit = function(now) {
      Object.keys(handlers).forEach(function(id) {
        handlers[id].call(null, now);
      })
    }
  })(toolkit.ns('clock.event'));

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
      var sign = degrees > 0 ? 1 : -1;
      var count = Math.floor(Math.abs(degrees) / unit);
      for (var i = 0; i < count; i++) {
        result.push(unit * sign);
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

    utils.fuzzyAngle = function(variable, baseline, accuracy) {
      accuracy = accuracy || 10;
      var upper = baseline + accuracy;
      var lower = baseline - accuracy;
      if (lower < 0) {
        variable = variable > upper ? variable - 360 : variable;
      }
      return upper >= variable && lower <= variable;
    };
  })(toolkit.ns('utils'));

  (function(logger) {
    var LOG_LEVELS = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    };
    var level_ = LOG_LEVELS.INFO;
    var buffers_ = [];

    function buildMessage_(args) {
      var i, msg = [];
      for (i = 0; i < args.length; i++) {
        if (typeof args[i] === 'object') {
          msg.push(JSON.stringify(args[i]));
        } else {
          msg.push(args[i]);
        }
      }
      return msg.join(' ');
    }

    function write_(message, robot) {
      if (robot && robot.log) {
        robot.log(message);
      } else {
        console.log(message);
      }
    }

    function log_(context, levelLabel, args) {
      if (level_ > LOG_LEVELS[levelLabel]) {
        return;
      }
      var message = '[' + levelLabel + '] ' + toolkit.now() + ' ' + context + ': ' + buildMessage_(args);
      buffers_.push(message);
    }

    logger.get = function (context) {
      return {
        debug: function() {
          log_(context, 'DEBUG', Array.prototype.slice.call(arguments));
        },
        info: function() {
          log_(context, 'INFO', Array.prototype.slice.call(arguments));
        },
        warn: function() {
          log_(context, 'WARN', Array.prototype.slice.call(arguments));
        },
        error: function() {
          log_(context, 'ERROR', Array.prototype.slice.call(arguments));
        }
      };
    };

    logger.setLevel = function(levelLabel) {
      if (LOG_LEVELS[levelLabel] !== undefined) {
        level_ = LOG_LEVELS[levelLabel];
      }
    };

    logger.flush = function(robot) {
      var message;
      while (message = buffers_.shift()) {
        write_(message, robot);
      }
    };
  })(toolkit.ns('logger'));

  /**
   * status
   */
  (function(status){
    function Status() {
      this.robotFound = false;
      this.idleCount = 0;
      this.direction = 1;
      this.initialized = false;
    }
    Status.prototype.init = function(conf) {
      conf = conf || {};
      this.direction = conf.direction || direction;
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
    Status.prototype.reverseDirection = function() {
      this.direction *= -1;
    };

    var robots_ = {};
    status.get = function(id) {
      if (!robots_[id]) {
        robots_[id] = new Status();
      }
      return robots_[id];
    };

    status.list = function() {
      var list = [];
      Object.keys(robots_).forEach(function(id) {
        list.push({
          id: id,
          sts: robots_[id]
        });
      });
      return list;
    };

    status.toString = function() {
      return JSON.stringify(robots_);
    };

    status.clear = function() {
      robots_ = {};
    };
  })(toolkit.ns('status'));

  /**
   * radar
   */
  (function(radar) {
    var robots_ = {};

    radar.mark = function(robot) {
      var prev = robots_[robot.id];
      robots_[robot.id] = {
        robot: robot,
        updatedTime: toolkit.now()
      };
      if (prev && prev.updatedTime - toolkit.now() < 30) {
        robots_[robot.id].prev = {
          robot: prev.robot,
          updatedTime: prev.updatedTime
        };
      }
      return robots_[robot.id];
    };

    radar.getMarker = function(robot) {
      return robots_[robot.id];
    };

    radar.unmark = function(robot) {
      delete robots_[robot.id];
    };

    radar.reset = function() {
      robots_ = [];
    };

    radar.searchClosest = function(me) {
      var utils = toolkit.ns('utils');
      var log = toolkit.getLogger('radar.searchClosest');
      var list = Object.keys(robots_).filter(function(id) {
        var target = robots_[id];
        return (toolkit.now() - target.updatedTime) <= 100;
      }).sort(function(t1, t2) {
        var mPos = me.position;
        var tPos1 = robots_[t1].robot.position;
        var tPos2 = robots_[t2].robot.position;
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
      log.debug(list);
      return list.length === 0 ? null : robots_[list[0]];
    }

    radar.searchLeader = function(me) {
      var utils = toolkit.ns('utils');
      var log = toolkit.getLogger('radar.searchLeader');
      var list = Object.keys(robots_).filter(function(id) {
        var target = robots_[id];
        if (toolkit.now() - target.updatedTime <= 100) {
          if (target.robot.parentId === null) {
            return true;
          }
        }
        return false;
      });
      log.debug(list);
      return list.lenght === 0 ? null : robots_[list[0]];
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
      var log = toolkit.getLogger('command.trace');
      var basePosition = robot.position;
      var degrees = utils.calclateAngle(basePosition, dest);
      log.debug('c.x=' + basePosition.x + ',c.y=' + basePosition.y + ',angle=' + robot.angle);
      log.debug('d.x=' + dest.x + ',d.y=' + dest.y);
      log.debug('degrees=' + degrees);
      var length = Math.sqrt(Math.pow(basePosition.y - dest.y, 2) + Math.pow(basePosition.x - dest.x, 2));
      command.turnTo(robot, degrees);
      robot.ahead(length);
    };

    command.turnToDest = function(robot, dest, offset) {
      var utils = toolkit.ns('utils');
      var log = toolkit.getLogger('command.turnToDest');
      offset = offset || 0;
      var mPos = robot.position;
      var degrees = utils.calculateAngle(mPos, dest);
      log.debug('curr', mPos, 'dest', dest, 'degrees', degrees);
      command.turnTo(robot, degrees + offset);
    };

    command.turnTo = function(robot, degrees) {
      var utils = toolkit.ns('utils');
      var log = toolkit.getLogger('command.turnTo');
      degrees = utils.deltaAngle(robot.angle, degrees);
      if (degrees !== 0) {
        log.debug('before', robot.angle, 'delta', degrees);
        robot.turn(degrees);
        log.debug('after', robot.angle);
      }
    };

    command.turnCannonToDest = function(robot, dest, offset) {
      var utils = toolkit.ns('utils');
      offset = offset || 0;
      var log = toolkit.getLogger('command.turnCannonToDest');
      var mPos = robot.position;
      var degrees = utils.calculateAngle(mPos, dest);
      log.debug('curr', mPos, 'dest', dest, 'degrees', degrees);
      command.turnCannonTo(robot, degrees + offset);
    };

    command.turnCannonTo = function(robot, degrees) {
      var utils = toolkit.ns('utils');
      var log = toolkit.getLogger('command.turnCannonTo');
      degrees = utils.deltaAngle(robot.cannonAbsoluteAngle, degrees);
      if (degrees !== 0) {
        log.debug('before', robot.cannonAbsoluteAngle, 'delta', degrees);
        robot.rotateCannon(degrees);
      }
    };
  })(toolkit.ns('command'));

  // alias
  toolkit.getLogger = toolkit.ns('logger').get;
  toolkit.getStatus = toolkit.ns('status').get;
  toolkit.tick = toolkit.ns('clock').tick;
  toolkit.now = toolkit.ns('clock').now;
  toolkit.setupProxy = toolkit.ns('proxy').setup;
})();
