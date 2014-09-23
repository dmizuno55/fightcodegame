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
    me.log('angle=' + me.angle);
  },
  go: function(robot, distance) {
    var curPos = robot.position;
    var dir = Math.atan2(curPos.y - distance.y, curPos.x - distance.y) * 180 / Math.PI;
    var length = Math.sqrt(Math.pow(curPos.y - distance.y, 2) + Math.pow(curPos.x - distance.x, 2));
    Command.turnTo(robot, dir);
    robot.ahead(length);
  },
  turnTo: function(robot, direction) {
    robot.log('before angle=' + robot.angle);
    if (robot.angle > direction) {
      robot.turn(-1 * (robot.angle - direction));
    } else {
      robot.turn(direction - robot.angle);
    }
    robot.log('after angle=' + robot.angle);
  }
};

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
