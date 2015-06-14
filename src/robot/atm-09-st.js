//FightCode can only understand your robot
//if its class is called Robot
var Robot = function(robot) {
  robot.clone();
};

Robot.prototype.onIdle = function(ev) {
  // load toolkit
  var status = toolkit.ns('status'),
      clock = toolkit.ns('clock'),
      utils = toolkit.ns('utils'),
      radar = toolkit.ns('radar'),
      command = toolkit.ns('command');

  clock.tick();

  var log = utils.logger('Robot.onIdle', robot);
  var robot = ev.robot;
  var sts = status.get(robot.id);

  sts.idle();
  if (sts.robotFound) {
    return;
  }

  if (robot.cannonRelativeAngle !== 180) {
    robot.rotateCannon(180 - robot.cannonRelativeAngle);
    if (!sts.initialize) {
      utils.isClone(robot) ? sts.init(-1) : sts.init(1);
    }
  }

  var target = radar.search(robot);
  if (target) {
    robot.stop();
    var targetPos = radar.forecastPosition(target);
    command.turnToDest(robot, targetPos);
    command.turnCannonToDest(robot, targetPos);
  } else {
    robot.move(50 * sts.direction);
  }
};

Robot.prototype.onScannedRobot = function(ev) {
  var status = toolkit.ns('status'),
      clock = toolkit.ns('clock'),
      utils = toolkit.ns('utils'),
      radar = toolkit.ns('radar');

  var robot = ev.robot;
  var target = ev.scannedRobot;
  var log = utils.logger('Robot.onScannedRobot', robot);
  var sts = status.get(robot.id);

  if (utils.isBuddy(robot, target)) {
    return;
  }

  sts.encount();

  log(target.id, clock.now());
  radar.mark(target);

  var i, dir, slide;
  for (i = 0; i < 10; i++) {
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
