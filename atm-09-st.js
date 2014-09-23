
//FightCode can only understand your robot
//if its class is called Robot
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
  formatMessage: function(context, message) {
    return '[' + context + '] ' + message;
  }
};

var Command = {
  trace: function(me, target) {
    var mPos = me.position;
    var tPos = target.position;
    var dirX = tPos.x > mPos.x ? 1 : -1;
    var dirY = tPos.y > mPos.y ? 1 : -1;
    if (dirX > 0 && dirY < 0) {
      Command.turnTo(me, 45);
    } else if (dirX < 0 && dirY < 0) {
      Command.turnTo(me, 135);
    } else if (dirX < 0 && dirY > 0) {
      Command.turnTo(me, 225);
    } else if (dirX < 0 && dirY < 0) {
      Command.turnTo(me, 315);
    }
    me.log(Utils.formatMessage('Command.trace', 'angle=' + me.angle));
  },
  go: function(robot, distance) {
    var curPos = robot.position;
    var dir = Math.atan2(Math.abs(distance.y - curPos.y), Math.abs(distance.x - curPos.x)) * 180 / Math.PI;
    robot.log(Utils.formatMessage('Command.go', 'c.x=' + curPos.x + ',c.y=' + curPos.y + ',angle=' + robot.angle));
    robot.log(Utils.formatMessage('Command.go', 'd.x=' + distance.x + ',d.y=' + distance.y));
    robot.log(Utils.formatMessage('Command.go', 'dir=' + dir));
    var length = Math.sqrt(Math.pow(curPos.y - distance.y, 2) + Math.pow(curPos.x - distance.x, 2));
    var absoluteDir = dir > 0 ? 360 - dir : 360 + dir;
    robot.log(Utils.formatMessage('Command.go', 'absoluteDir=' + absoluteDir));
    Command.turnTo(robot.turn(absoluteDir));
    robot.ahead(length);
  },
  turnTo: function(robot, directionion) {
    robot.log(Utils.formatMessage('Command.turnTo', 'before angle=' + robot.angle));
    if (robot.angle > directionion) {
      robot.turn(-1 * (robot.angle - directionion));
    } else {
      robot.turn(directionion - robot.angle);
    }
    robot.log(Utils.formatMessage('Command.turnTo', 'after angle=' + robot.angle));
  }
};

var Status = (function() {
  var robots = {};
  function get(id) {
    if (!robots[id]) {
      robots[id] = {
        robotFound: false,
        idleCount: 0,
        direction: 1
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
    robot.log(Utils.formatMessage('Robot.onIdle', 'init'));
    robot.rotateCannon(180 - robot.cannonRelativeAngle);
    if (Utils.isClone(robot)) {
      status.direction = -1;
    } else {
      status.direction = 1;
    }
  }

  if (!status.robotFound) {
    robot.move(10, status.direction);
    robot.turn(1);
  }
  robot.log(Utils.formatMessage('Robot.onIdle', 'Status=' + Status.dump()));
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

  robot.log(Utils.formatMessage('Robot.onScannedRobot', 'id=' + robot.id));
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
  robot.log(Utils.formatMessage('Robot.onRobotCollision', 'bearing=' + ev.bearing));
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
  robot.log(Utils.formatMessage('Robot.onHitByBullet', 'bearing=' + ev.bearing));
  robot.turn(ev.bearing - 90);

};

Robot.prototype.onWallCollision = function(ev) {
  var robot = ev.robot;
  robot.turn(90 + ev.bearing);
};
