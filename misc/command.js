var Command = {
  trace: function(me, target) {
    var mPos = me.position;
    var tPos = target.position;
    var dirX = tPos.x > mPos.x ? 1 : -1;
    var dirY = tPos.y > mPos.y ? 1 : -1;
    if (dirX > 0 && dirY < 0) {
      Utils.turnTo(me, 45);
    } else if (dirX < 0 && dirY < 0) {
      Utils.turnTo(me, 135);
    } else if (dirX < 0 && dirY > 0) {
      Utils.turnTo(me, 225);
    } else if (dirX < 0 && dirY < 0) {
      Utils.turnTo(me, 315);
    }
    me.log('angle=' + me.angle);
  },
  go: function(robot, distance) {
    var curPos = robot.position;
    if (!(curPos.x < (distance.x + 10) && curPos.x > (distance.x - 10))) {
      Utils.turnTo(robot, 90);
      if (curPos.x < distance.x) {
        robot.ahead(distance.x - curPos.x);
      } else {
        robot.back(curPos.x - distance.x);
      }
    }
    if (!(curPos.y < (distance.y + 10) && curPos.y > (distance.y - 10))) {
      Utils.turnTo(robot, 180);
      if (curPos.y < distance.y) {
        robot.ahead(distance.y - curPos.y);
      } else {
        robot.back(curPos.y - distance.y);
      }
    }
  },
  turnTo: function(robot, direction) {
    robot.log('before angle=' + robot.angle);
    if (robot.angle > direction) {
      robot.turn(-1 * (robot.angle - direction));
    } else {
      robot.turn(direction - robot.angle);
    }
    robot.log('after angle=' + robot.angle);
  }
};
