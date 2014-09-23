var Status = (function() {
  var robots = {};
  function get(id) {
    if (!robots[id]) {
      robots[id] = {
        robotFound: false,
        idleCount: 0,
        direction: 1
      };
    }
    return robots[id];
  }
  function dump() {
    return JSON.stringify(robots);
  }
  return {
    get: get,
    dump: dump
  }
})();
