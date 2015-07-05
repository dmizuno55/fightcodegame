module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      atm09st: {
        src: ['src/modules/index.js', 'src/robot/atm-09-st.js'],
        dest: 'dist/atm-09-st.js'
      },
      crisscross: {
        src: ['src/modules/index.js', 'src/robot/crisscross.js'],
        dest: 'dist/crisscross.js'
      },
      test: {
        src: ['src/modules/index.js', 'src/robot/test.js'],
        dest: 'dist/test.js'
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['concat']);
};
