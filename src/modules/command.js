var Command = {
  trace: function(me, target) {
    var mPos = me.position;
    var tPos = target.position;
    var dir = Math.atan2(Math.abs(tPos.y - mPos.y), Math.abs(tPos.x - mPos.x)) * 180 / Math.PI;
    var absoluteDir = dir > 0 ? 360 - dir : 360 + dir;
    Command.turnTo(me, absoluteDir);
    me.log(Utils.formatLog('Command.trace', 'angle=' + me.angle));
  },
  go: function(robot, distance) {
    var curPos = robot.position;
    var dir = Math.atan2(Math.abs(distance.y - curPos.y), Math.abs(distance.x - curPos.x)) * 180 / Math.PI;
    robot.log(Utils.formatLog('Command.go', 'c.x=' + curPos.x + ',c.y=' + curPos.y + ',angle=' + robot.angle));
    robot.log(Utils.formatLog('Command.go', 'd.x=' + distance.x + ',d.y=' + distance.y));
    robot.log(Utils.formatLog('Command.go', 'dir=' + dir));
    var length = Math.sqrt(Math.pow(curPos.y - distance.y, 2) + Math.pow(curPos.x - distance.x, 2));
    var absoluteDir = dir > 0 ? 360 - dir : 360 + dir;
    robot.log(Utils.formatLog('Command.go', 'absoluteDir=' + absoluteDir));
    Command.turnTo(robot.turn(absoluteDir));
    robot.ahead(length);
  },
  turnTo: function(robot, degrees) {
    robot.log(Utils.formatLog('Command.turnTo', 'before angle=' + robot.angle));
    if (robot.angle > degrees) {
      robot.turn(robot.angle - degrees);
    } else {
      robot.turn(degrees - robot.angle);
    }
    robot.log(Utils.formatLog('Command.turnTo', 'after angle=' + robot.angle));
  }
};
