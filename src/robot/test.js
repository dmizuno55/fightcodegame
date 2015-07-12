//FightCode can only understand your robot
//if its class is called Robot
var Robot = function(robot) {
  toolkit.ns('logger').filter(/(turnTo|turnCannonTo|onScannedRobot)\]/);
  toolkit.ns('clock.event').on(function(now) {
    if (now % 50 === 0) {
      var status = toolkit.ns('status');
      status.list.forEach(function(elem) {
        elem.sts.direction *= -1;
      });
    }
  });
};

Robot.prototype.onIdle = function(ev) {
  var robot = ev.robot;

  var status = toolkit.ns('status');
  var log = toolkit.getLogger('Robot.onIdle', robot);
  var sts = status.get(robot.id);

  if (!sts.initialized) sts.init(1);

  sts.idle();
  if (sts.robotFound) {
    return;
  }

  log('idle');
  robot.rotateCannon(10);

  robot.move(sts.direction * 100);
};

Robot.prototype.onScannedRobot = function(ev) {
  var robot = ev.robot;
  var target = ev.scannedRobot;

  var utils = toolkit.ns('utils'),
      status = toolkit.ns('status'),
      command = toolkit.ns('command');
  var log = toolkit.getLogger('Robot.onScannedRobot', robot);
  var sts = status.get(robot.id);

  sts.encount();

  var frontAngle = utils.calculateAngle(robot.position, target.position) + 90;
  log('angle', robot.angle, 'cannonRelativeAngle', robot.cannonRelativeAngle, 'frontAngle', frontAngle);
  command.turnTo(robot, frontAngle);
  command.turnCannonTo(robot, frontAngle - robot.cannonRelativeAngle);

  robot.fire();
};

Robot.prototype.onRobotCollision = function(ev) {
  var robot = ev.robot;
  var log = toolkit.getLogger('Robot.onRobotCollision', robot);

  log('angle', robot.angle, 'bearing', ev.bearing);
  if ((ev.bearing <= 30 && ev.bearing >= 0) || (ev.bearing >= -30 && ev.bearing <= 0)) {
    robot.back(100);
  } else if ((ev.bearing >= 150 && ev.bearing <= 180) || (ev.bearing <= -150 && ev.bearing >= -180)) {
    robot.ahead(100);
  }
};

Robot.prototype.onHitByBullet = function(ev) {
  var command = toolkit.ns('command');

  var robot = ev.robot;
  var log = toolkit.getLogger('Robot.onHitByBullet', robot);

  if (robot.parentId === null && robot.life <= 40) {
    robot.disappear();
  }

  log('angle', robot.angle, 'bearing', ev.bearing);
  command.turnTo(robot, robot.angle + ev.bearing -robot.cannonRelativeAngle + 90);
};

Robot.prototype.onWallCollision = function(ev) {
  var robot = ev.robot;
  var log = toolkit.getLogger('Robot.onWallCollision', robot);

  log('angle', robot.angle, 'bearing', ev.bearing);
  robot.turn(90 + ev.bearing);
  robot.ahead(10);
};
