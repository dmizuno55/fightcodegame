//FightCode can only understand your robot
//if its class is called Robot
var Robot = function(robot) {
  toolkit.ns('logger').setLevel('DEBUG');

  var sts = toolkit.getStatus(robot.id);
  sts.init({direction: 1});

  toolkit.setupProxy(this);

  var event = toolkit.ns('clock.event');
  event.on(function(now) {
    if (now % 30 === 0) {
      sts.turnDirection *= -1;
    }
  });
};

Robot.prototype.onIdle = function(ev) {
  var log = toolkit.getLogger('Robot.onIdle');
  var command = toolkit.ns('command'),
      utils = toolkit.ns('utils');

  var robot = ev.robot;
  var sts = toolkit.getStatus(robot.id);
  sts.idle();

  // fix cannon angle
  if (robot.cannonRelativeAngle > 270) {
    robot.rotateCannon(360 - robot.cannonRelativeAngle);
  } else if (robot.cannonRelativeAngle < 90) {
    robot.rotateCannon(-robot.cannonRelativeAngle);
  } else {
    robot.rotateCannon(180 - robot.cannonRelativeAngle);
  }

  robot.move(10, sts.direction);
  robot.turn(10 * sts.turnDirection);
  log.debug('turnDirection', sts.turnDirection);
};

Robot.prototype.onScannedRobot = function(ev) {

  var log = toolkit.getLogger('Robot.onScannedRobot');
  var radar = toolkit.ns('radar');

  var robot = ev.robot;
  var target = ev.scannedRobot;
  var sts = toolkit.getStatus(robot.id);

  sts.encount();
  radar.mark(target);
  robot.fire();
};

Robot.prototype.onRobotCollision = function(ev) {

  var log = toolkit.getLogger('Robot.onRobotCollision');
  var radar = toolkit.ns('radar'),
      utils = toolkit.ns('utils');

  var robot = ev.robot;
  var sts = toolkit.getStatus(robot.id);

  var collidedRobot = ev.collidedRobot;

  if (!utils.isBuddy(robot, collidedRobot)) {
    sts.encount();
    radar.mark(collidedRobot);
  }
};

Robot.prototype.onHitByBullet = function(ev) {
  var log = toolkit.getLogger('Robot.onHitByBullet', robot);
  var command = toolkit.ns('command');

  var robot = ev.robot;
  var sts = toolkit.getStatus(robot.id);

  var targetDegrees = robot.angle + ev.bearing + 90;
  log.debug('targetDegrees', targetDegrees, 'bearing', ev.bearing);
  command.turnCannonTo(robot, targetDegrees);
};

Robot.prototype.onWallCollision = function(ev) {

  var log = toolkit.getLogger('Robot.onWallCollision', robot);

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
  robot.turn(turnDegrees);
  robot.rotateCannon(-turnDegrees);
  sts.reverseDirection();
  robot.move(10, sts.direction);
};
