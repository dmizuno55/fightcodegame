//FightCode can only understand your robot
//if its class is called Robot
var Robot = function(robot) {
  toolkit.ns('logger').setLevel('DEBUG');

  var sts = toolkit.getStatus(robot.id);
  sts.init({direction: 1});

  toolkit.setupProxy(this);
};

Robot.prototype.onIdle = function(ev) {
  var log = toolkit.getLogger('Robot.onIdle');
  var command = toolkit.ns('command');

  var robot = ev.robot;
  var sts = toolkit.getStatus(robot.id);
  sts.idle();

  //command.turnToDest(robot, {x: 0, y: robot.arenaHeight / 2});
  robot.move(10, sts.direction);
  log.debug('cannonRelativeAngle', robot.cannonRelativeAngle);

};

Robot.prototype.onScannedRobot = function(ev) {

  var log = toolkit.getLogger('Robot.onScannedRobot');
  var radar = toolkit.ns('radar');

  var robot = ev.robot;
  var target = ev.scannedRobot;
  var sts = toolkit.getStatus(robot.id);

  sts.encount();
  radar.mark(target);

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

  var robot = ev.robot;
  var sts = toolkit.getStatus(robot.id);

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
