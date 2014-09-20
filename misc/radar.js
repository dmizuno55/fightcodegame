var Radar = {
  robots: {},
  mark: function(robot) {
    Radar.robots[robot.id] = robot;
  },
  search: function(me) {
    var mPos = me.position;
    var e, ePos, enemy;
    var dx = me.arenaWidth; // farthest point
    var dy = me.arenaHeight; // farthest point
    var target;
    for (e in Radar.robots) {
      me.log('dx=' + dx + ',dy=' + dy);
      target = Radar.robots[e];
      ePos = target.position;
      if (dx > Math.abs(mPos.x - ePos.x) || dy > Math.abs(mPos.y - ePos.y)) {
        dx = Math.abs(mPos.x - ePos.x);
        dy = Math.abs(mPos.y - ePos.y);
        enemy = target;
      }
    }
    return enemy;
  }
};
