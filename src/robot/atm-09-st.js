//FightCode can only understand your robot
//if its class is called Robot
var Robot = function(robot) {
  robot.clone();
};

Robot.prototype.onIdle = function(ev) {
  // load toolkitk
  toolkit.ns('clock').tick();
  var status = toolkit.ns('status'),
      utils = toolkit.ns('utils'),
      radar = toolkit.ns('radar'),
      command = toolkit.ns('command');

  var robot = ev.robot;
  var sts = status.get(robot.id);
  var log = utils.logger('Robot.onIdle', robot);

  sts.idleCount++;
  if (sts.idleCount > 50) {
    sts.robotFound = false;
  }

  if (robot.cannonRelativeAngle !== 180) {
    log('init');
    robot.rotateCannon(180 - robot.cannonRelativeAngle);
    if (utils.isClone(robot)) {
      sts.direction = -1;
    } else {
      sts.direction = 1;
    }
  }

  if (!sts.robotFound) {
    var target = radar.search(robot);
    if (target) {
      command.trace(robot, target);
    } else {
      robot.move(10, sts.direction);
      robot.turn(1 * (sts.idleCount % 50));
    }
  }
  log('Status=' + status.dump());
};

Robot.prototype.onScannedRobot = function(ev) {
  var status = toolkit.ns('status'),
      utils = toolkit.ns('utils'),
      radar = toolkit.ns('radar');

  var robot = ev.robot;
  var target = ev.scannedRobot;
  var log = utils.logger('Robot.onScannedRobot', robot);
  var sts = status.get(robot.id);

  if (utils.isBuddy(robot, target)) {
    return;
  }

  sts.robotFound = true;
  sts.idleCount = 0;

  radar.mark(target);

  log('id=' + robot.id);
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
  var utils = toolkit.ns('utils');

  var robot = ev.robot;
  var log = utils.logger('Robot.onRobotCollision', robot);

  log('bearing=' + ev.bearing);
  if ((ev.bearing <= 30 && ev.bearing >= 0) || (ev.bearing >= -30 && ev.bearing <= 0)) {
    robot.back(100);
  } else if ((ev.bearing >= 150 && ev.bearing <= 180) || (ev.bearing <= -150 && ev.bearing >= -180)) {
    robot.ahead(100);
  }
  robot.turn(ev.bearing - 90);
};

Robot.prototype.onHitByBullet = function(ev) {
  var utils = toolkit.ns('utils');

  var robot = ev.robot;
  var log = utils.logger('Robot.onHitByBullet', robot);

  log('bearing=' + ev.bearing);
  robot.turn(ev.bearing - 90);
};

Robot.prototype.onWallCollision = function(ev) {
  var robot = ev.robot;
  robot.turn(90 + ev.bearing);
};
