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
