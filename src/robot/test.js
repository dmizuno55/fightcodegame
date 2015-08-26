//FightCode can only understand your robot
//if its class is called Robot
var Robot = function(robot) {
  toolkit.ns('logger').setLevel('DEBUG');

  toolkit.setupProxy(this);
};

Robot.prototype.onIdle = function(ev) {
  var log = toolkit.getLogger('Robot.onIdle');
  var command = toolkit.ns('command');

  var robot = ev.robot;
  var sts = toolkit.getStatus(robot.id);
  sts.idle();

  command.goTo(robot, {x: robot.arenaWidth / 2, y: robot.arenaHeight / 2});
  command.turnTo(robot, 90);
  if (robot.cannonRelativeAngle !== 90) {
    log.info(robot.cannonRelativeAngle);
    robot.rotateCannon(90 - robot.cannonRelativeAngle);
  }

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
  var radar = toolkit.ns('radar');

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
};
