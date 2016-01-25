module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        banner:
            '/*!\n'+
            ' * jQuery highlightTextarea <%= pkg.version %>\n'+
            ' * Copyright 2014-<%= grunt.template.today("yyyy") %> Damien "Mistic" Sorel (http://www.strangeplanet.fr)\n'+
            ' * Licensed under MIT (http://opensource.org/licenses/MIT)\n'+
            ' */',

        // compress js
        uglify: {
            options: {
                banner: '<%= banner %>\n'
            },
            dist: {
                files: {
                    'jquery.highlighttextarea.min.js': [
                        'jquery.highlighttextarea.js'
                    ]
                }
            }
        },

        // compress css
        cssmin: {
            options: {
                banner: '<%= banner %>',
                keepSpecialComments: 0
            },
            dist: {
                files: {
                    'jquery.highlighttextarea.min.css': [
                        'jquery.highlighttextarea.css'
                    ]
                }
            }
        },

        // jshint tests
        jshint: {
            lib: {
                files: {
                    src: [
                        'jquery.highlighttextarea.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', [
        'uglify',
        'cssmin'
    ]);
    
    grunt.registerTask('test', [
        'jshint'
    ]);
};