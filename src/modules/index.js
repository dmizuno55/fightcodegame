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
   * utils
   */
  var utils = toolkit.ns('utils');
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
  })(utils);

  /**
   * status
   */
  var status = toolkit.ns('status');
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
  })(status);

  /**
   * radar
   */
  var radar = toolkit.ns('radar');
  (function(radar) {
    var robots = {};

    radar.mark = function(robot) {
      robots[robot.id] = robot;
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
        ePos = target.position;
        if (dx > Math.abs(mPos.x - ePos.x) || dy > Math.abs(mPos.y - ePos.y)) {
          dx = Math.abs(mPos.x - ePos.x);
          dy = Math.abs(mPos.y - ePos.y);
          enemy = target;
        }
      }
      return enemy;
    };
  })(radar);

  /**
   * tracker
   */
  var tracker = toolkit.ns('tracker');
  (function(tracker) {
    var robots = {};

    tracker.mark = function(robot) {
      robots[robot.id] = robot;
    };

    tracker.reset = function(robot) {
      delete robots[robot.id];
    };

    tracker.search = function(me) {
      var log = utils.logger('tracker.search', me);
      var mPos = me.position;
      var e, ePos, enemy;
      var dx = me.arenaWidth - me.position.x < me.arenaWidth / 2 ? 0 : me.arenaWidth; // farthest point
      var dy = me.arenaHeight - me.position.y < me.arenaHeight / 2 ? 0 : me.arenaHeight; // farthest point
      var target;
      for (e in robots) {
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
  })(tracker);

  /**
   * command
   */
  var command = toolkit.ns('command');
  (function(command) {
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
  })(command);
})();
