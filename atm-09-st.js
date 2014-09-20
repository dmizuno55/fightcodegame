//FightCode can only understand your robot
//if its class is called Robot
var Radar = {
  robots: {},
  mark: function(robot) {
    Radar.robots[robot.id] = robot;
  },
  search: function(me) {
    var mPos = me.position;
    var e, ePos, enemy;
    var dx = me.arenaWidth; // farthest point
    var dy = me.arenaHeight; // farthest point
    var target;
    for (e in Radar.robots) {
      me.log('dx=' + dx + ',dy=' + dy);
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
  trace: function(me, target) {
    var mPos = me.position;
    var tPos = target.position;
    var dirX = tPos.x > mPos.x ? 1 : -1;
    var dirY = tPos.y > mPos.y ? 1 : -1;
    if (dirX > 0 && dirY < 0) {
      Utils.turnTo(me, 45);
    } else if (dirX < 0 && dirY < 0) {
      Utils.turnTo(me, 135);
    } else if (dirX < 0 && dirY > 0) {
      Utils.turnTo(me, 225);
    } else if (dirX < 0 && dirY < 0) {
      Utils.turnTo(me, 315);
    }
    me.log('angle=' + me.angle);
  },
  go: function(robot, distance) {
    var curPos = robot.position;
//    var dir = Math.atan2(curPos.y - distance.y, curPos.x - distance.y) * 180 / Math.PI;
//    Utils.turnTo(robot, dir);
//    var length = Math.sqrt(Math.pow(curPos.y - distance.y, 2) + Math.pow(curPos.x - distance.x, 2));
//    robot.ahead(length);

    if (!(curPos.x < (distance.x + 10) && curPos.x > (distance.x - 10))) {
      Utils.turnTo(robot, 90);
      if (curPos.x < distance.x) {
        robot.ahead(distance.x - curPos.x);
      } else {
        robot.back(curPos.x - distance.x);
      }
    }
    if (!(curPos.y < (distance.y + 10) && curPos.y > (distance.y - 10))) {
      Utils.turnTo(robot, 180);
      if (curPos.y < distance.y) {
        robot.ahead(distance.y - curPos.y);
      } else {
        robot.back(curPos.y - distance.y);
      }
    }
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
//  robot.ignore('onScannedRobot');
//  robot.ignore('onHitByBullet');
  this.robotFound = false;
  robot.clone();
};

Robot.prototype.onIdle = function(ev) {
  var robot = ev.robot;
//  robot.log('onIdle');
  if (Utils.isClone(robot)) {
    var center = {'x': (robot.arenaWidth / 2), 'y': (robot.arenaHeight / 2)};
    Utils.go(robot, center);
    robot.turn(1);
    return;
  }
  var enemy = Radar.search(robot);
  if (enemy) {
    robot.log('find enemy');
    Utils.go(robot, enemy.position);
  } else {
    robot.log('not find');
  }
//  robot.rotateCannon(1);

//  if (!this.robotFound) {
//    robot.turn(1);
//  } else {
//    robot.ahead(50);
//    robot.back(50);
//  }
//  robot.ahead(10);
};

Robot.prototype.onScannedRobot = function(ev) {
  var robot = ev.robot;
  var target = ev.scannedRobot;
//  this.robotFound = true;
  if (Utils.isClone(robot)) {
    if (!Utils.isBuddy(robot, target)) {
      Radar.mark(target);
      robot.fire();
    }
    return;
  }

  robot.log('id=' + robot.id);
  if (!Utils.isBuddy(robot, target)) {
    Radar.mark(target);
    var i;
//    robot.stop();
    for (i = 0; i < 5; i++) {
      robot.fire();
//      robot.rotateCannon(i % 2 === 0 ? 5 : -5);
    }
  } else {
//    robot.turn(10);
  }
  robot.ahead(10);
};

Robot.prototype.onRobotCollision = function(ev) {
  var robot = ev.robot;
  if (Utils.isClone(robot)) {
    return;
  }
  robot.turn(ev.bearing);
  robot.back(100);
};

Robot.prototype.onHitByBullet = function(ev) {
  var robot = ev.robot;
  if (Utils.isClone(robot)) {
    return;
  }
  robot.log('onHitByBullet: bearing=' + ev.bearing);
  robot.turn(ev.bearing);
//  robot.back(50);
};

Robot.prototype.onWallCollision = function(ev) {
  var robot = ev.robot;
  var before = robot.angle;
//  var bearing = ev.bearing === 0 ? 90 : ev.bearing;
  robot.turn(90 + bearing);
  robot.log('before=' + before + ',after=' + robot.angle + ',bearing=' + ev.bearing);
};
