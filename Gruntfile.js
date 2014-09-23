module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      atm09st: {
        src: ['src/robot/atm-09-st.js', 'src/modules/status.js', 'src/modules/utils.js', 'src/modules/radar.js', 'src/modules/command.js'],
        dest: 'dist/atm-09-st.js'
      },
      crisscross: {
        src: ['src/robot/crisscross.js', 'src/modules/command.js', 'src/modules/utils.js'],
        dest: 'dist/crisscross.js'
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['concat']);
};
