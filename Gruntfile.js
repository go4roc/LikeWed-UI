module.exports = function (grunt) {
    'use strict';

    // Force use of Unix newlines
    grunt.util.linefeed = '\n';

    RegExp.quote = function (string) {
        return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    var fs = require('fs');
    var path = require('path');
    var LessdocParser = require('./grunt/lessdoc-parser.js');
    var getLessVarsData = function () {
        var filePath = path.join(__dirname, 'less/variables.less');
        var fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
        var parser = new LessdocParser(fileContent);
        return { sections: parser.parseFile() };
    };
    var configBridge = grunt.file.readJSON('./grunt/configBridge.json', { encoding: 'utf8' });

    // Project configuration.
    grunt.initConfig({

        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
            ' * LikeWed UI v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
            ' * Copyright 2014-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
            ' */\n',
        jqueryCheck: configBridge.config.jqueryCheck.join('\n'),
        jqueryVersionCheck: configBridge.config.jqueryVersionCheck.join('\n'),

        // Task configuration.
        clean: {
            options: {
                force: true
            },
            build: 'build',
            dist: 'dist',
            ideasDist: '../LikeWed-Ideas/public/core'
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            grunt: {
                options: {
                    jshintrc: 'grunt/.jshintrc'
                },
                src: ['Gruntfile.js', 'grunt/*.js']
            },
            core: {
                src: 'js/*.js'
            },
            ideas: {
                src: 'ideas/js/*.js'
            }
        },

        jscs: {
            options: {
                config: 'js/.jscsrc'
            },
            grunt: {
                src: '<%= jshint.grunt.src %>'
            },
            core: {
                src: '<%= jshint.core.src %>'
            },
            ideas: {
                src: '<%= jshint.ideas.src %>'
            }
        },

        concat: {
            options: {
                banner: '<%= banner %>\n<%= jqueryCheck %>\n<%= jqueryVersionCheck %>',
                stripBanners: false
            },
            bootstrap: {
                src: [
                    'bootstrap-3.3.1/js/transition.js',
                    'bootstrap-3.3.1/js/alert.js',
                    'bootstrap-3.3.1/js/button.js',
                    'bootstrap-3.3.1/js/carousel.js',
                    'bootstrap-3.3.1/js/collapse.js',
                    'bootstrap-3.3.1/js/dropdown.js',
                    'bootstrap-3.3.1/js/modal.js',
                    'bootstrap-3.3.1/js/tooltip.js',
                    'bootstrap-3.3.1/js/popover.js',
                    'bootstrap-3.3.1/js/scrollspy.js',
                    'bootstrap-3.3.1/js/tab.js',
                    'bootstrap-3.3.1/js/affix.js'
                ],
                dest: 'build/js/bootstrap.js'
            },
            core: {
                src: [
                    '<%= concat.bootstrap.dest %>'
                ],
                dest: 'dist/js/<%= pkg.name %>.js'
            }
        },

        uglify: {
            options: {
                preserveComments: 'some'
            },
            core: {
                src: '<%= concat.core.dest %>',
                dest: 'dist/js/<%= pkg.name %>.min.js'
            }
        },

        less: {
            compileCore: {
                options: {
                    strictMath: true,
                    sourceMap: true,
                    outputSourceFiles: true,
                    sourceMapURL: '<%= pkg.name %>.css.map',
                    sourceMapFilename: 'dist/css/<%= pkg.name %>.css.map'
                },
                src: 'less/likewed.less',
                dest: 'dist/css/<%= pkg.name %>.css'
            },
            compileIdeas: {
                options: {
                    strictMath: true,
                    sourceMap: true,
                    outputSourceFiles: true,
                    sourceMapURL: '<%= pkg.name %>.ideas.css.map',
                    sourceMapFilename: 'dist/css/<%= pkg.name %>.ideas.css.map'
                },
                src: 'ideas/ideas.less',
                dest: 'dist/css/<%= pkg.name %>.ideas.css'
            }
        },

        autoprefixer: {
            options: {
                browsers: configBridge.config.autoprefixerBrowsers
            },
            core: {
                options: {
                    map: true
                },
                src: 'dist/css/<%= pkg.name %>.css'
            },
            ideas: {
                options: {
                    map: true
                },
                src: 'dist/css/<%= pkg.name %>.ideas.css'
            }
        },

        csslint: {
            options: {
                csslintrc: '.csslintrc'
            },
            dist: [
                'dist/css/likewed.css',
                'dist/css/likewed.ideas.css'
            ]
        },

        cssmin: {
            options: {
                compatibility: 'ie8',
                keepSpecialComments: '*',
                noAdvanced: true
            },
            minifyCore: {
                src: 'dist/css/<%= pkg.name %>.css',
                dest: 'dist/css/<%= pkg.name %>.min.css'
            },
            minifyIdeas: {
                src: 'dist/css/<%= pkg.name %>.ideas.css',
                dest: 'dist/css/<%= pkg.name %>.ideas.min.css'
            }
        },

        csscomb: {
            options: {
                config: '.csscomb.json'
            },
            dist: {
                expand: true,
                cwd: 'dist/css/',
                src: ['*.css', '!*.min.css'],
                dest: 'dist/css/'
            }
        },

        copy: {
            fonts: {
                expand: true,
                cwd: 'font-awesome-4.2.0/',
                src: 'fonts/*',
                dest: 'dist/'
            },
            ideasDist: {
                expand: true,
                cwd: 'dist/',
                src: '**',
                dest: '../LikeWed-Ideas/public/core/'
            }
        },

        watch: {
            src: {
                files: '<%= jshint.core.src %>',
                tasks: ['jshint:src', 'concat']
            },
            less: {
                files: 'less/**/*.less',
                tasks: 'less'
            }
        },

        sed: {
            versionNumber: {
                pattern: (function () {
                    var old = grunt.option('oldver');
                    return old ? RegExp.quote(old) : old;
                })(),
                replacement: grunt.option('newver'),
                recursive: true
            }
        }
    });


    // These plugins provide necessary tasks.
    require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
    require('time-grunt')(grunt);


    // JS distribution task.
    grunt.registerTask('dist-js', ['concat', 'uglify:core']);

    // CSS distribution task.
    grunt.registerTask('less-compile', ['less:compileCore', 'less:compileIdeas']);
    grunt.registerTask('dist-css', ['less-compile', 'autoprefixer:core', 'autoprefixer:ideas', 'csscomb:dist', 'cssmin:minifyCore', 'cssmin:minifyIdeas']);

    // Full distribution task.
    grunt.registerTask('dist', ['clean:build', 'clean:dist', 'dist-css', 'copy:fonts', 'dist-js']);

    grunt.registerTask('dist:ideas', ['clean:build', 'clean:dist', 'dist-css', 'copy:fonts', 'dist-js', 'clean:ideasDist', 'copy:ideasDist']); 

    // Default task.
    grunt.registerTask('default', ['clean:build', 'clean:dist', 'copy:fonts']);

    // Version numbering task.
    // grunt change-version-number --oldver=A.B.C --newver=X.Y.Z
    // This can be overzealous, so its changes should always be manually reviewed!
    grunt.registerTask('change-version-number', 'sed');
};
