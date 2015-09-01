var Robot = function(robot) {
  toolkit.ns('logger').setLevel('DEBUG');

  robot.clone();
  toolkit.setupProxy(this);
};

Robot.prototype.onIdle = function(ev) {
  var command = toolkit.ns('command'),
      utils = toolkit.ns('utils');
  var robot = ev.robot;

  var sts = toolkit.getStatus(robot.id);
  if (!sts.initialized) {
    utils.isClone(robot) ? sts.init({direction: -1}) : sts.init({direction: 1});
  }

  if (utils.isClone(robot)) {
    robot.angle > 90 ? command.turnTo(robot, 180) : command.turnTo(robot, 0);
  } else {
    robot.angle > 90 ? command.turnTo(robot, 270) : command.turnTo(robot, 90);
  }
  if (robot.cannonRelativeAngle !== 180) {
    robot.rotateCannon(90);
  }

  robot.move(10, sts.direction);
};

Robot.prototype.onScannedRobot = function(ev) {
  var utils = toolkit.ns('utils');

  var robot = ev.robot;
  var target = ev.scannedRobot;

  if (utils.isBuddy(robot, target)) {
    return;
  }

  var i;
  for (i = 0; i < 5; i++) {
    robot.fire();
  }
};

Robot.prototype.onWallCollision = function(ev) {
  var log = toolkit.getLogger('Robot.onWallCollision');
  var robot = ev.robot;
  var sts = toolkit.getStatus(robot.id);

  var turnDegrees;
  if (Math.abs(ev.bearing) > 90) {
    turnDegrees = (180 - Math.abs(ev.bearing)) * 2;
    if (ev.bearing > 0) {
      turnDegrees *= -1;
    }
  } else {
    turnDegrees = ev.bearing * 2;
  }
  log.debug('angle', robot.angle, 'bearing', ev.bearing, 'direction', sts.direction, 'turnDegrees', turnDegrees);
  // robot.move(5, sts.direction * -1);
  robot.turn(turnDegrees);
  if (sts.robotFound) {
    robot.rotateCannon(-turnDegrees);
  }
  sts.reverseDirection();
  robot.move(10, sts.direction);
};

Robot.prototype.onHitByBullet = function(ev) {
  var robot = ev.robot;
  robot.turn(ev.bearing);
};
