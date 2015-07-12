//FightCode can only understand your robot
//if its class is called Robot
var Robot = function(robot) {
  toolkit.ns('logger').filter(/\[Robot/);
  toolkit.ns('clock.event').on(function(now) {
    if (now % 50 === 0) {
      var status = toolkit.ns('status');
      status.list.forEach(function(elem) {
        elem.sts.direction *= -1;
      });
    }
  });
  robot.clone();
};

Robot.prototype.onIdle = function(ev) {
  toolkit.tick();

  var utils = toolkit.ns('utils'),
      radar = toolkit.ns('radar'),
      command = toolkit.ns('command');

  var robot = ev.robot;
  var log = toolkit.getLogger('Robot.onIdle', robot);
  var sts = toolkit.getStatus(robot.id);

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
  toolkit.tick();

  var utils = toolkit.ns('utils'),
      command = toolkit.ns('command'),
      radar = toolkit.ns('radar');

  var robot = ev.robot;
  var log = toolkit.getLogger('Robot.onScannedRobot', robot);
  var sts = toolkit.getStatus(robot.id);
  var target = ev.scannedRobot;

  if (utils.isBuddy(robot, target)) {
    robot.back(10);
    return;
  }

  sts.encount();
  radar.mark(target);
  // robot.stop();

  // for (var i = 0; i < 3; i++) {
  //   robot.fire();
  // }
  var relativeAngle = utils.deltaAngle(robot.angle, robot.cannonAbsoluteAngle);
  // robot.turn(relativeAngle);
  // robot.rotateCannon(-relativeAngle);
  // var degrees = utils.splitDegrees(frontAngle, 10)[0];
  // robot.turn(degrees);
  // robot.rotateCannon(-degrees);
  // for (var i = 0; i < 10; i++) {
  //   robot.fire();
  //   //robot.move(5, (i % 2 === 0 ? 1 : -1));
  // }
  utils.splitDegrees(relativeAngle, 30).forEach(function(degrees) {
    robot.fire();
    robot.turn(degrees);
    robot.rotateCannon(-degrees);
  });

  // for (var i = 0; i < 4; i++) {
  //   var dir = i % 2 === 0 ? 1 : -1;
  //   robot.fire();
  //   robot.rotateCannon(dir * 3);
  // }

  var dest = utils.calculatePosition(robot.position, robot.angle, 10);
  var angle = utils.calculateCannonAngle(dest, target.position);
  robot.move(sts.direction * 10);
  command.turnCannonTo(robot, angle);
  robot.fire();


  // log('angle', robot.angle, 'cannonRelativeAngle', robot.cannonRelativeAngle, 'relativeAngle', relativeAngle);
  // log('ahead before', robot.position);
  // robot.ahead(10);
  // log('ahead after', robot.position);
  // var dest = utils.calculatePosition(robot.position, robot.angle, 10);
  // var angle = utils.calculateCannonAngle(dest, target.position);
  // command.turnCannonTo(robot, angle);
  // log('robot.position', robot.position, 'dest', dest, 'robot.cannonAbsoluteAngle', robot.cannonAbsoluteAngle, 'angle', angle);
};

Robot.prototype.onRobotCollision = function(ev) {
  toolkit.tick();

  var utils = toolkit.ns('utils'),
      radar = toolkit.ns('radar'),
      command = toolkit.ns('command');

  var robot = ev.robot;
  var log = toolkit.getLogger('Robot.onRobotCollision', robot);
  var sts = toolkit.getStatus(robot.id);

  var collidedRobot = ev.collidedRobot;

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
  toolkit.tick();

  var utils = toolkit.ns('utils'),
      command = toolkit.ns('command');

  var robot = ev.robot;
  var log = toolkit.getLogger('Robot.onHitByBullet', robot);

  if (robot.parentId === null && robot.life <= 40) {
    robot.disappear();
  }

  log('angle', robot.angle, 'cannonAbsoluteAngle', robot.cannonAbsoluteAngle, 'bearing', ev.bearing);
  // convert into cannon absolute angle
  var targetDegrees = robot.angle + ev.bearing + 90;
  log('absoluteDegrees', targetDegrees);
  command.turnCannonTo(robot, targetDegrees);
};

Robot.prototype.onWallCollision = function(ev) {
  toolkit.tick();

  var robot = ev.robot;
  var log = toolkit.getLogger('Robot.onWallCollision', robot);
  var sts = toolkit.getStatus(robot.id);

  if (sts.robotFound) {
    return;
  }

  log('angle', robot.angle, 'bearing', ev.bearing);
  robot.turn(90 + ev.bearing);
  robot.ahead(10);
};
