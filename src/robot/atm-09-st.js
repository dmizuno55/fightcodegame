//FightCode can only understand your robot
//if its class is called Robot
var Robot = function(robot) {
  toolkit.ns('logger').setLevel('DEBUG');
  robot.clone();

  toolkit.setupProxy(this);
};

Robot.prototype.onIdle = function(ev) {
  var utils = toolkit.ns('utils'),
      radar = toolkit.ns('radar'),
      command = toolkit.ns('command'),
      log = toolkit.getLogger('Robot.onIdle');

  var robot = ev.robot;
  var sts = toolkit.getStatus(robot.id);

  if (!sts.initialized) {
    utils.isClone(robot) ? sts.init({direction: -1}) : sts.init({direction: 1});
  }

  sts.idle();
  if (sts.robotFound) {
    var marker = radar.searchLeader(robot) || radar.searchClosest(robot);
    if (marker) {
      log.debug('robot found');
      var targetPos = marker.robot.position;
      command.turnCannonToDest(robot, targetPos);
    }
    return;
  }

  var marker = radar.searchLeader(robot) || radar.searchClosest(robot);
  if (marker) {
    log.debug('robot found');
    var targetPos = radar.forecast(marker);
    command.turnCannonToDest(robot, targetPos);
  } else {
    // TODO: define cannon rotate range min max, by position
    // var position = robot.position;
    // if (position.x < 20) {
    //   log.debug('near left side wall', robot.angle, robot.cannonAbsoluteAngle);
    //   command.turnCannonTo(robot, 180);
    //   command.turnTo(robot, 0);
    // } else if (robot.arenaWidth - position.x < 20) {
    //   log.debug('near right side wall', robot.angle, robot.cannonAbsoluteAngle);
    //   command.turnCannonTo(robot, 0);
    //   command.turnTo(robot, 180);
    // } else if (robot.y < 20) {
    //   log.debug('near top side wall', robot.angle, robot.cannonAbsoluteAngle);
    //   command.turnCannonTo(robot, 90);
    //   command.turnTo(robot, 90);
    // } else if (robot.arenaHeight - robot.y < 20) {
    //   log.debug('near bottom side wall', robot.angle, robot.cannonAbsoluteAngle);
    //   command.turnCannonTo(robot, 270);
    //   command.turnTo(robot, 270);
    // } else {
      robot.move(10, sts.direction);
      robot.rotateCannon(5 * sts.direction);
    // }
  }
};

Robot.prototype.onScannedRobot = function(ev) {

  var utils = toolkit.ns('utils'),
      command = toolkit.ns('command'),
      radar = toolkit.ns('radar'),
      log = toolkit.getLogger('Robot.onScannedRobot');

  var robot = ev.robot;
  var target = ev.scannedRobot;
  var sts = toolkit.getStatus(robot.id);

  if (utils.isBuddy(robot, target)) {
    log.debug('scanned, but buddy');
    sts.reverseDirection();
    robot.move(5, sts.direction);
    return;
  }

  sts.encount();
  radar.mark(target);

  // log('angle 0 or 180', robot.cannonRelativeAngle);
  // var targetPos = target.position;
  // var marker = radar.searchLeader(robot) || radar.searchClosest(robot);
  // if (marker) {
  //   targetPos = radar.forecast(marker);
  // }
  // var dest = utils.calculatePosition(robot.position, robot.angle, 10 * sts.direction);
  // var angle = utils.calculateCannonAngle(dest, targetPos);
  // robot.move(10, sts.direction);
  // command.turnCannonTo(robot, angle);

  if (utils.inFuzzyAngle(robot.cannonRelativeAngle, 0) || utils.inFuzzyAngle(robot.cannonRelativeAngle, 180)) {
    log.debug('angle 0 or 180', robot.cannonRelativeAngle);
    robot.fire();
    var targetPos = target.position;
    var dest = utils.calculatePosition(robot.position, robot.angle, 10 * sts.direction);
    var angle = utils.calculateCannonAngle(dest, targetPos);
    robot.move(10, sts.direction);
    command.turnCannonTo(robot, angle);
    robot.fire();
  } else {
    robot.fire();
    var relativeAngle = utils.deltaAngle(robot.angle, robot.cannonAbsoluteAngle);
    log.debug('angle other', robot.angle, robot.cannonAbsoluteAngle, relativeAngle);
    // utils.splitDegrees(relativeAngle, 30).forEach(function(partOfAngle) {
    //   robot.fire();
    //   robot.turn(partOfAngle);
    //   robot.rotateCannon(-partOfAngle);
    // });
    var partOfAngle = utils.splitDegrees(relativeAngle, 30)[0];
    robot.turn(partOfAngle);
    robot.rotateCannon(-partOfAngle);
  }
};

Robot.prototype.onRobotCollision = function(ev) {

  var utils = toolkit.ns('utils'),
      radar = toolkit.ns('radar'),
      command = toolkit.ns('command'),
      log = toolkit.getLogger('Robot.onRobotCollision');

  var robot = ev.robot;
  var sts = toolkit.getStatus(robot.id);

  var collidedRobot = ev.collidedRobot;

  log.debug('angle', robot.angle, 'bearing', ev.bearing);
  if (!utils.isBuddy(robot, collidedRobot)) {
    sts.encount();
    radar.mark(collidedRobot);
    command.turnCannonToDest(robot, collidedRobot.position);
  } else {
    if ((ev.bearing <= 30 && ev.bearing >= 0) || (ev.bearing >= -30 && ev.bearing <= 0)) {
      robot.back(100);
      robot.turn(30);
    } else if ((ev.bearing >= 150 && ev.bearing <= 180) || (ev.bearing <= -150 && ev.bearing >= -180)) {
      robot.ahead(100);
      robot.turn(-30);
    }
  }
};

Robot.prototype.onHitByBullet = function(ev) {

  var utils = toolkit.ns('utils'),
      command = toolkit.ns('command'),
      log = toolkit.getLogger('Robot.onHitByBullet', robot);

  var robot = ev.robot;
  var sts = toolkit.getStatus(robot.id);

  if (robot.parentId === null && robot.life <= 40) {
    robot.disappear();
  }

  log.debug('angle', robot.angle, 'cannonAbsoluteAngle', robot.cannonAbsoluteAngle, 'bearing', ev.bearing);
  // convert into cannon absolute angle
  if (!sts.robotFound) {
    var targetDegrees = robot.angle + ev.bearing + 90;
    log.debug('absoluteDegrees', targetDegrees);
    command.turnCannonTo(robot, targetDegrees);
    robot.move(30, sts.direction);
  }
};

Robot.prototype.onWallCollision = function(ev) {
  var radar = toolkit.ns('radar'),
      utils = toolkit.ns('utils'),
      command = toolkit.ns('command'),
      log = toolkit.getLogger('Robot.onWallCollision', robot);

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
  // robot.move(5, sts.direction * -1);
  robot.turn(turnDegrees);
  if (sts.robotFound) {
    robot.rotateCannon(-turnDegrees);
  }
  sts.reverseDirection();
  robot.move(10, sts.direction);
};
