var Robot = function(robot) {
  this.direction = 1;
};

Robot.prototype.onIdle = function(ev) {
  var robot = ev.robot;
  if (robot.cannonRelativeAngle !== 180) {
    robot.rotateCannon(90);
  }

  Command.turnTo(robot, 90);
};

Robot.prototype.onScannedRobot = function(ev) {
  var robot = ev.robot;
  var i;
  for (i = 0; i < 5; i++) {
    robot.fire();
  }
};

Robot.prototype.onWallCollision = function(ev) {
  var robot = ev.robot;
  if (Utils.isClone(robot)) {
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
