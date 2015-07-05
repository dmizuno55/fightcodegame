//FightCode can only understand your robot
//if its class is called Robot
var Robot = function(robot) {
  toolkit.ns('logger').filter(/\[Robot/);
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

  var log = toolkit.getLogger('Robot.onIdle', robot);
  var robot = ev.robot;
  var sts = status.get(robot.id);

  sts.idle();
  if (sts.robotFound) {
    return;
  }

  if (!sts.initialized) {
    utils.isClone(robot) ? sts.init(-1) : sts.init(1);
  }

  var target = radar.searchLeader(robot) || radar.searchClosest(robot);
  if (target) {
    robot.stop();
    var targetPos = target.robot.position;
    command.turnToDest(robot, targetPos, -robot.cannonRelativeAngle + 90);
  } else {
    robot.move(5 * sts.direction);
    robot.rotateCannon(30 * sts.direction);
  }
};

Robot.prototype.onScannedRobot = function(ev) {
  var status = toolkit.ns('status'),
      clock = toolkit.ns('clock'),
      utils = toolkit.ns('utils'),
      command = toolkit.ns('command'),
      radar = toolkit.ns('radar');

  clock.tick();

  var robot = ev.robot;
  var target = ev.scannedRobot;
  var log = toolkit.getLogger('Robot.onScannedRobot', robot);
  var sts = status.get(robot.id);

  if (utils.isBuddy(robot, target)) {
    robot.back(10);
    return;
  }

  sts.encount();
  radar.mark(target);
  robot.stop();

  for (var i = 0; i < 5; i++) {
    robot.fire();
    robot.ahead(3);
    var dest = utils.calclatePosition(robot.position, robot.angle, 3);
    var angle = utils.calclateAngle(dest, target.position);
    command.turnCannonTo(robot, angle);
  }
  // var relativeAngle = utils.deltaAngle(robot.angle, robot.cannonAbsoluteAngle);
  // robot.turn(relativeAngle);
  // robot.rotateCannon(-relativeAngle);
  // var degrees = utils.splitDegrees(frontAngle, 10)[0];
  // robot.turn(degrees);
  // robot.rotateCannon(-degrees);
  // for (var i = 0; i < 10; i++) {
  //   robot.fire();
  //   //robot.move(5, (i % 2 === 0 ? 1 : -1));
  // }
  // utils.splitDegrees(relativeAngle, 10).forEach(function(degrees) {
  //   robot.fire();
  //   robot.turn(degrees);
  //   robot.rotateCannon(-degrees);
  // });
  // log('angle', robot.angle, 'cannonRelativeAngle', robot.cannonRelativeAngle, 'relativeAngle', relativeAngle);
};

Robot.prototype.onRobotCollision = function(ev) {
  var utils = toolkit.ns('utils'),
      clock = toolkit.ns('clock'),
      radar = toolkit.ns('radar'),
      command = toolkit.ns('command'),
      status = toolkit.ns('status');

  clock.tick();

  var robot = ev.robot;
  var sts = status.get(robot);
  var collidedRobot = ev.collidedRobot;

  var log = toolkit.getLogger('Robot.onRobotCollision', robot);

  if (!utils.isBuddy(robot, collidedRobot)) {
    sts.encout();
    radar.mark(collidedRobot);
  }

  // TODO if colliedRobot is buddy, get out. if not, turn to it.
  log('angle', robot.angle, 'bearing', ev.bearing);
  if ((ev.bearing <= 30 && ev.bearing >= 0) || (ev.bearing >= -30 && ev.bearing <= 0)) {
    robot.back(100);
  } else if ((ev.bearing >= 150 && ev.bearing <= 180) || (ev.bearing <= -150 && ev.bearing >= -180)) {
    robot.ahead(100);
  }
};

Robot.prototype.onHitByBullet = function(ev) {
  var clock = toolkit.ns('clock'),
      utils = toolkit.ns('utils'),
      command = toolkit.ns('command');

  clock.tick();

  var robot = ev.robot;
  var log = toolkit.getLogger('Robot.onHitByBullet', robot);

  if (robot.parentId === null && robot.life <= 40) {
    robot.disappear();
  }

  // TODO cannon turn to it.
  log('angle', robot.angle, 'bearing', ev.bearing);
  command.turnTo(robot, robot.angle + ev.bearing -robot.cannonRelativeAngle + 90);
};

Robot.prototype.onWallCollision = function(ev) {
  var robot = ev.robot;

  toolkit.ns('clock').tick();

  var log = toolkit.getLogger('Robot.onWallCollision', robot);

  log('angle', robot.angle, 'bearing', ev.bearing);
  robot.turn(90 + ev.bearing);
  robot.ahead(10);
};
