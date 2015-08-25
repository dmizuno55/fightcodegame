//FightCode can only understand your robot
//if its class is called Robot
var Robot = function(robot) {
  toolkit.ns('logger').setLevel('DEBUG');
  toolkit.setupHandlers(this);
};

Robot.prototype.onIdle = function(ev) {
  var robot = ev.robot;
  var sts = toolkit.getStatus(robot);
  if (!sts.initialized) {
    sts.init({direction: -1});
  }

  sts.idle();
  if (!sts.robotFound)  {
    robot.rotateCannon(10);
  }
  robot.move(10, sts.direction);
};

Robot.prototype.onScannedRobot = function(ev) {
  var utils = toolkit.ns('utils');
  var log = toolkit.getLogger('Robot.onScannedRobot');
  var robot = ev.robot;
  var sts = toolkit.getStatus(robot);

  sts.encount();
  var relativeAngle = utils.deltaAngle(robot.angle, robot.cannonAbsoluteAngle);
  log.debug('angle other', robot.angle, robot.cannonAbsoluteAngle, relativeAngle);
  utils.splitDegrees(relativeAngle, 30).forEach(function(partOfAngle) {
    robot.turn(partOfAngle);
    robot.rotateCannon(-partOfAngle);
  });
};

Robot.prototype.onRobotCollision = function(ev) {
};

Robot.prototype.onHitByBullet = function(ev) {
};

Robot.prototype.onWallCollision = function(ev) {
  var log = toolkit.getLogger('Robot.onWallCollisioin');
  var robot = ev.robot;
  var sts = toolkit.getStatus(robot);
  var bearing = ev.bearing;

  //robot.turn(bearing * -1 * sts.direction);
  robot.turn(90);
  log.debug('angle', robot.angle, 'bearing', bearing);
};
