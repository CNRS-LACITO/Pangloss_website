module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['css/semantic/uncompressed/modules/search.js','css/semantic/uncompressed/modules/dropdown.js','css/semantic/uncompressed/modules/checkbox.js','css/semantic/uncompressed/modules/dimmer.js','css/semantic/uncompressed/modules/modal.js','css/semantic/uncompressed/modules/accordion.js','css/semantic/uncompressed/modules/jquery.address.js','css/semantic/uncompressed/modules/tab.js','css/semantic/uncompressed/modules/sidebar.js','css/semantic/uncompressed/modules/popup.js','css/semantic/uncompressed/modules/behavior/form.js','custom-js/FormToWizard/*.js','custom-js/jquery-ui-1.10.4.custom/js/jquery-ui-1.10.4.custom.js','custom-js/jquery.imgareaselect/js/jquery.imgareaselect.multiple.js','custom-js/wavesurferjs/wavesurfer.min.js','custom-js/wavesurferjs/wavesurfer.regions.min.js','custom-js/wavesurferjs/wavesurfer.timeline.min.js','eastling-js/*.js', 'custom-js/*.js'],
        dest: 'dist/eastling.js',
      },
    },
    concat_css: {
      options: {
        // Task-specific options go here. 
      },
      all: {
        src: ['css/semantic/packaged/css/semantic.min.css','css/*.css','custom-js/FormToWizard/*.css','custom-js/jquery.imgareaselect/css/imgareaselect-default.css'],
        dest: "dist/eastling.css"
      },
    },
    uglify: {
      my_target: {
        files: {
          'dist/eastling.min.js': ['dist/eastling.js']
        }
      }
    },
    cssmin: {
      options: {
        mergeIntoShorthands: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'dist/eastling.min.css': ['dist/eastling.css']
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-concat-css');
  //grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');


  // Default task(s).
  grunt.registerTask('default', ['concat','concat_css','uglify','cssmin']);

};