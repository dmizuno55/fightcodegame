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

  var log = toolkit.getLogger('Robot.onIdle', robot);
  var robot = ev.robot;
  var sts = status.get(robot.id);

  sts.idle();
  if (sts.robotFound) {
    return;
  }

  if (robot.cannonRelativeAngle !== 180) {
    if (sts.idleCount < 100) {
      robot.rotateCannon(180 - robot.cannonRelativeAngle);
    }
    if (!sts.initialized) {
      utils.isClone(robot) ? sts.init(-1) : sts.init(1);
    }
  }

  var target = radar.searchLeader(robot) || radar.searchClosest(robot);
  if (target) {
    robot.stop();
    var targetPos = target.robot.position;
    command.turnToDest(robot, targetPos, -robot.cannonRelativeAngle + 90);
  } else {
    robot.move(10 * sts.direction);
    var center = {
      x: robot.arenaWidth / 2,
      y: robot.arenaHeight / 2
    };
    command.turnToDest(robot, center, -robot.cannonRelativeAngle + 90);
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
    robot.move(30 * sts.direction);
    return;
  }

  sts.encount();
  radar.mark(target);
  robot.stop();

  var i, dir, slide;
  for (i = 0; i < 10; i++) {
    if (i % 2 === 0) {
      dir = 1;
      slide = 1;
    } else {
      dir = -1;
      slide = 0;
    }
    if (slide > 0) {
      robot.rotateCannon(slide * sts.direction);
      robot.turn(slide * sts.direction * -1);
    }
    robot.fire();
    robot.move(5 + slide, dir);
  }
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

  log(robot.angle, ev.bearing);
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

  log(robot.angle, ev.bearing);
  command.turnTo(robot, robot.angle + ev.bearing -robot.cannonRelativeAngle + 90);
};

Robot.prototype.onWallCollision = function(ev) {
  var robot = ev.robot;

  toolkit.ns('clock').tick();

  var log = toolkit.getLogger('Robot.onWallCollision', robot);

  log(robot.angle, ev.bearing);
  robot.turn(90 + ev.bearing);
};
