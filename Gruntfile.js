module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        banner:
            '/*!\n'+
            ' * jQuery highlightTextarea <%= pkg.version %>\n'+
            ' * Copyright <%= grunt.template.today("yyyy") %> Damien "Mistic" Sorel (http://www.strangeplanet.fr)\n'+
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', [
        'uglify',
        'cssmin'
    ]);
};