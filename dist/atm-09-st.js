//FightCode can only understand your robot
//if its class is called Robot
var Robot = function(robot) {
  robot.clone();
};

Robot.prototype.onIdle = function(ev) {
  var robot = ev.robot;
  var status = Status.get(robot.id);
  status.idleCount++;
  if (status.idleCount > 50) {
    status.robotFound = false;
  }

  if (robot.cannonRelativeAngle !== 180) {
    robot.log(Utils.formatLog('Robot.onIdle', 'init'));
    robot.rotateCannon(180 - robot.cannonRelativeAngle);
    if (Utils.isClone(robot)) {
      status.direction = -1;
    } else {
      status.direction = 1;
    }
  }

  if (!status.robotFound) {
    var target = Radar.search(robot);
    if (target) {
      Command.trace(robot, target);
    } else {
      robot.move(10, status.direction);
      robot.turn(1);
    }
  }
  robot.log(Utils.formatLog('Robot.onIdle', 'Status=' + Status.dump()));
};

Robot.prototype.onScannedRobot = function(ev) {
  var robot = ev.robot;
  var target = ev.scannedRobot;
  if (Utils.isBuddy(robot, target)) {
    return;
  }

  var status = Status.get(robot.id);
  status.robotFound = true;
  status.idleCount = 0;

  Radar.mark(target);

  robot.log(Utils.formatLog('Robot.onScannedRobot', 'id=' + robot.id));
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
  var robot = ev.robot;
  robot.log(Utils.formatLog('Robot.onRobotCollision', 'bearing=' + ev.bearing));
  if ((ev.bearing <= 30 && ev.bearing >= 0) || (ev.bearing >= -30 && ev.bearing <= 0)) {
    robot.back(100);
  } else if ((ev.bearing >= 150 && ev.bearing <= 180) || (ev.bearing <= -150 && ev.bearing >= -180)) {
    robot.ahead(100);
  }
  robot.turn(ev.bearing - 90);
};

Robot.prototype.onHitByBullet = function(ev) {
  var robot = ev.robot;
  var status = Status.get(robot.id);
  robot.log(Utils.formatLog('Robot.onHitByBullet', 'bearing=' + ev.bearing));
  robot.turn(ev.bearing - 90);

};

Robot.prototype.onWallCollision = function(ev) {
  var robot = ev.robot;
  robot.turn(90 + ev.bearing);
};

var Status = (function() {
  var robots = {};
  function get(id) {
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
  }
  function dump() {
    return JSON.stringify(robots);
  }
  return {
    get: get,
    dump: dump
  }
})();

var Utils = {
  isClone: function(robot) {
    return robot.parentId !== null;
  },
  isBuddy: function(me, other) {
    if (me.id === other.parentId || me.parentId === other.id) {
      return true;
    } else {
      return false;
    }
  },
  formatLog: function(context, message) {
    return '[' + context + '] ' + message;
  }
};

var Radar = {
  robots: {},
  mark: function(robot) {
    Radar.robots[robot.id] = robot;
  },
  reset: function(robot) {
    delete Radar.robots[robot.id];
  },
  search: function(me) {
    var mPos = me.position;
    var e, ePos, enemy;
    var dx = me.arenaWidth; // farthest point
    var dy = me.arenaHeight; // farthest point
    var target;
    for (e in Radar.robots) {
      me.log(Utils.formatLog('Radar.search', 'dx=' + dx + ',dy=' + dy));
      target = Radar.robots[e];
      ePos = target.position;
      if (dx > Math.abs(mPos.x - ePos.x) || dy > Math.abs(mPos.y - ePos.y)) {
        dx = Math.abs(mPos.x - ePos.x);
        dy = Math.abs(mPos.y - ePos.y);
        enemy = target;
      }
    }
    return enemy;
  }
};

var Command = {
  trace: function(me, target) {
    var mPos = me.position;
    var tPos = target.position;
    var dir = Math.atan2(Math.abs(tPos.y - mPos.y), Math.abs(tPos.x - mPos.x)) * 180 / Math.PI;
    var absoluteDir = dir > 0 ? 360 - dir : 360 + dir;
    Command.turnTo(me, absoluteDir);
    me.log(Utils.formatLog('Command.trace', 'angle=' + me.angle));
  },
  go: function(robot, distance) {
    var curPos = robot.position;
    var dir = Math.atan2(Math.abs(distance.y - curPos.y), Math.abs(distance.x - curPos.x)) * 180 / Math.PI;
    robot.log(Utils.formatLog('Command.go', 'c.x=' + curPos.x + ',c.y=' + curPos.y + ',angle=' + robot.angle));
    robot.log(Utils.formatLog('Command.go', 'd.x=' + distance.x + ',d.y=' + distance.y));
    robot.log(Utils.formatLog('Command.go', 'dir=' + dir));
    var length = Math.sqrt(Math.pow(curPos.y - distance.y, 2) + Math.pow(curPos.x - distance.x, 2));
    var absoluteDir = dir > 0 ? 360 - dir : 360 + dir;
    robot.log(Utils.formatLog('Command.go', 'absoluteDir=' + absoluteDir));
    Command.turnTo(robot.turn(absoluteDir));
    robot.ahead(length);
  },
  turnTo: function(robot, degrees) {
    robot.log(Utils.formatLog('Command.turnTo', 'before angle=' + robot.angle));
    if (robot.angle > degrees) {
      robot.turn(robot.angle - degrees);
    } else {
      robot.turn(degrees - robot.angle);
    }
    robot.log(Utils.formatLog('Command.turnTo', 'after angle=' + robot.angle));
  }
};
