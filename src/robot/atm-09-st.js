//FightCode can only understand your robot
//if its class is called Robot
var Robot = function(robot) {
  toolkit.ns('logger').setLevel('DEBUG');
  robot.clone();

  toolkit.setupProxy(this);

  var event = toolkit.ns('clock.event');
  event.on(function(now) {
    var sts = toolkit.getStatus(robot.id);
    if (now % 100 === 0) {
      sts.turnDirection *= -1;
    }
  });
};

Robot.prototype.onIdle = function(ev) {
  var utils = toolkit.ns('utils'),
      radar = toolkit.ns('radar'),
      command = toolkit.ns('command'),
      log = toolkit.getLogger('Robot.onIdle');

  var robot = ev.robot;
  var sts = toolkit.getStatus(robot.id);

  if (!sts.initialized) {
    utils.isClone(robot) ?
      sts.init({direction: -1, turnDirection: -1}) :
      sts.init({direction: 1, turnDirection: 1});
  }

  sts.idle();
  if (sts.robotFound) {
    var marker = radar.searchLeader(robot) || radar.searchClosest(robot);
    if (marker) {
      log.debug('robot found. lock-on');
      var targetPos = marker.robot.position;
      command.turnCannonToDest(robot, targetPos);
    }
    return;
  }

  var marker = radar.searchLeader(robot) || radar.searchClosest(robot);
  if (marker) {
    log.debug('robot found. forcast');
    var targetPos = radar.forecast(marker);
    command.turnCannonToDest(robot, targetPos);
  } else {
    log.debug('robot not found');
    robot.move(10, sts.direction);
    var deltaAngle = (10 - sts.idleCount / 10) * sts.turnDirection;
    robot.turn(deltaAngle);
    if (sts.ideleCount > 50) {
      robot.rotateCannon(10 * (-sts.turnDirection));
    }
    log.debug('move', 10 * sts.direction, 'turn', deltaAngle);

    var featureAngle = robot.angle + deltaAngle;
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

  robot.fire();
  if (utils.inFuzzyAngle(robot.cannonRelativeAngle, 0) || utils.inFuzzyAngle(robot.cannonRelativeAngle, 180)) {
    log.debug('angle 0 or 180', robot.cannonRelativeAngle);
    // for (var i = 0; i < 5; i ++) {
    //   robot.fire();
    //   robot.move(5, (i % 2 === 0 ? 1 : -1));
    // }
    var targetPos = target.position;
    var dest = utils.calculatePosition(robot.position, robot.angle, 10 * sts.direction);
    var angle = utils.calculateCannonAngle(dest, targetPos);
    robot.move(10, sts.direction);
    command.turnCannonTo(robot, angle);
    robot.fire();
  } else {
    var relativeAngle = utils.deltaAngle(robot.angle, robot.cannonAbsoluteAngle);
    log.debug('angle other', robot.angle, robot.cannonAbsoluteAngle, relativeAngle);
    // utils.splitDegrees(relativeAngle, 30).forEach(function(partOfAngle) {
    //   robot.fire();
    //   robot.turn(partOfAngle);
    //   robot.rotateCannon(-partOfAngle);
    // });
    var partOfAngle = utils.splitDegrees(relativeAngle, 30)[0];
    // robot.turn(partOfAngle);
    // robot.rotateCannon(-partOfAngle);

    var dest = utils.calculatePosition(robot.position, robot.angle + partOfAngle, 5 * sts.direction);
    var angle = utils.calculateCannonAngle(dest, target.position);
    robot.turn(partOfAngle);
    robot.move(5, sts.direction);
    command.turnCannonTo(robot, angle);
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
    if (utils.inRangeOfAngle(ev.bearing, 0, 30) || utils.inRangeOfAngle(ev.bearing, -30, 0)) {
      robot.back(100);
      robot.turn(30);
    } else if (utils.inRangeOfAngle(ev.bearing, 150, 180) || utils.inRangeOfAngle(ev.bearing, -180, -150)) {
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
    var targetDegrees = utils.convertToCannonAngle(robot.angle + ev.bearing);
    log.debug('absoluteDegrees', targetDegrees);
    command.turnCannonTo(robot, targetDegrees);
    //robot.move(30, sts.direction);
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
  //TODO if robot not found, make cannon angle an awesome angle
  robot.turn(turnDegrees);
  if (sts.robotFound) {
    robot.rotateCannon(-turnDegrees);
  } else {

  }
  sts.reverseDirection();
  robot.move(10, sts.direction);
};
