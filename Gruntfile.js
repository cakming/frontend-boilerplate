/*!
 * FireShell Gruntfile
 * http://getfireshell.com
 * @author Todd Motto
 */

'use strict';

/**
 * Livereload and connect variables
 */
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({
    port: LIVERELOAD_PORT
});

var mountFolder = function(connect, dir) {
    return require('serve-static')(require('path').resolve(dir));
};

/**
 * Grunt module
 */
module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-includes');

    /**
     * Dynamically load npm tasks
     */
    require('load-grunt-tasks')(grunt);

    /**
     * FireShell Grunt config
     */
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        /**
         * Set project info
         */
        project: {
            src: 'src',
            app: 'app',
            assets: '<%= project.app %>/assets',
            css: [
                '<%= project.src %>/scss/style.scss'
            ],
            cssmin: [
                '<%= project.src %>/components/normalize-css/normalize.css',
                '<%= project.src %>/components/bootstrap/dist/css/bootstrap.css',
                '<%= project.assets %>/css/style.unprefixed.css',
                '<%= project.assets %>/css/style.prefixed.css'
            ],
            js: [
                '<%= project.src %>/components/bootstrap/dist/js/bootstrap.js',
                '<%= project.src %>/js/plugins/*.js',
                '<%= project.src %>/js/*.js'
            ],
            jshint: [
                'src/js/*.js',
                'Gruntfile.js'
            ]
        },

        /**
         * Project banner
         * Dynamically prepand to CSS/JS files
         * Inherits text from package.json
         */
        tag: {
            banner: '/*!\n' +
                ' * <%= pkg.name %>\n' +
                ' * <%= pkg.title %>\n' +
                ' * <%= pkg.url %>\n' +
                ' * @author <%= pkg.author %>\n' +
                ' * @version <%= pkg.version %>\n' +
                ' * Copyright <%= pkg.copyright %>. <%= pkg.license %> licensed.\n' +
                ' */\n'
        },

        usebanner: {
            taskName: {
                options: {
                    position: 'top',
                    banner: '<%= tag.banner %>',
                    linebreak: true
                },
                files: {
                    src: ['<%= project.assets %>/css/style.min.css',
                        '<%= project.assets %>/js/scripts.min.js'
                    ]
                }
            }
        },

        /**
         * Connect port/livereload
         * https://github.com/gruntjs/grunt-contrib-connect
         * Starts a local webserver and injects
         * livereload snippet
         */
        connect: {
            options: {
                port: 9992,
                hostname: '*'
            },
            livereload: {
                options: {
                    middleware: function(connect) {
                        return [lrSnippet, mountFolder(connect, 'app')];
                    }
                }
            }
        },

        /**
         * Clean files and folders
         * https://github.com/gruntjs/grunt-contrib-clean
         * Remove generated files for clean deploy
         */
        clean: {
            dist: [
                '<%= project.assets %>/css/style.unprefixed.css',
                '<%= project.assets %>/css/style.prefixed.css'
            ]
        },

        /**
         * JSHint
         * https://github.com/gruntjs/grunt-contrib-jshint
         * Manage the options inside .jshintrc file
         */
        jshint: {
            files: '<%= project.jshint %>',
            options: {
                jshintrc: '.jshintrc'
            }
        },

        /**
         * Concatenate JavaScript files
         * https://github.com/gruntjs/grunt-contrib-concat
         * Imports all .js files and appends project banner
         */
        concat: {
            dev: {
                files: {
                    '<%= project.assets %>/js/scripts.min.js': '<%= project.js %>'
                }
            },
            options: {
                stripBanners: true,
                nonull: true,
            }
        },

        /**
         * Uglify (minify) JavaScript files
         * https://github.com/gruntjs/grunt-contrib-uglify
         * Compresses and minifies all JavaScript files into one
         */
        uglify: {
            dist: {
                files: {
                    '<%= project.assets %>/js/scripts.min.js': '<%= project.js %>'
                }
            }
        },

        /**
         * Compile Sass/SCSS files
         * https://github.com/gruntjs/grunt-contrib-sass
         * Compiles all Sass/SCSS files and appends project banner
         */
        sass: {
            dev: {
                options: {
                    style: 'expanded'
                },
                files: {
                    '<%= project.assets %>/css/style.unprefixed.css': '<%= project.css %>'
                }
            },
            dist: {
                options: {
                    style: 'expanded'
                },
                files: {
                    '<%= project.assets %>/css/style.unprefixed.css': '<%= project.css %>'
                }
            }
        },

        /**
         * Autoprefixer
         * Adds vendor prefixes automatically
         * https://github.com/nDmitry/grunt-autoprefixer
         */
        autoprefixer: {
            options: {
                browsers: [
                    'last 2 version',
                    'safari 6',
                    'ie 9',
                    'opera 12.1',
                    'ios 6',
                    'android 4'
                ]
            },
            dev: {
                files: {
                    '<%= project.assets %>/css/style.min.css': [
                        '<%= project.assets %>/css/style.unprefixed.css'
                    ]
                }
            },
            dist: {
                files: {
                    '<%= project.assets %>/css/style.prefixed.css': [
                        '<%= project.assets %>/css/style.unprefixed.css'
                    ]
                }
            }
        },

        /**
         * CSSMin
         * CSS minification
         * https://github.com/gruntjs/grunt-contrib-cssmin
         */
        cssmin: {
            dev: {
                files: {
                    '<%= project.assets %>/css/style.min.css': '<%= project.cssmin %>'
                }
            },
            dist: {
                files: {
                    '<%= project.assets %>/css/style.min.css': '<%= project.cssmin %>'
                }
            }
        },

        /**
         * Build bower components
         * https://github.com/yatskevich/grunt-bower-task
         */
        bower: {
            dev: {
                dest: '<%= project.assets %>/components/'
            },
            dist: {
                dest: '<%= project.assets %>/components/'
            }
        },

        /**
         * Opens the web server in the browser
         * https://github.com/jsoverson/grunt-open
         */
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            }
        },

        /**
         * Runs tasks against changed watched files
         * https://github.com/gruntjs/grunt-contrib-watch
         * Watching development files and run concat/compile tasks
         * Livereload the browser once complete
         */
        watch: {
            // Disable this because we will run it manually for js a
            // concat: {
            //     files: '<%= project.src %>/js/{,*/}*.js',
            //     tasks: ['concat:dev', 'jshint']
            // },
            // sass: {
            //     files: '<%= project.src %>/scss/{,*/}*.{scss,sass}',
            //     tasks: ['sass:dev', 'cssmin:dev', 'autoprefixer:dev']
            // },
            another: {
                files: ['<%= project.src %>/{,*/}*.html',],
                tasks: ['includes'],
                options: {
                    livereload: true,
                },
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= project.app %>/{,*/}*.html',
                    '<%= project.assets %>/css/*.css',
                    '<%= project.assets %>/js/{,*/}*.js',
                    '<%= project.assets %>/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },

        // Build the site using grunt-includes
        includes: {
            build: {
                cwd: 'src',
                src: ['*.html'],
                dest: 'app/',
                options: {
                    flatten: true,
                    includePath: 'src/template'
                }
            }
        }
    });

    /**
     * Default task
     * Run `grunt` on the command line
     */
    grunt.registerTask('default', [
        'includes',
        'sass:dev',
        //'bower:dev', -> Disable this until found way to include in single file
        'autoprefixer:dev',
        'cssmin:dev',
        'jshint',
        'concat:dev',
        'usebanner',
        'connect:livereload',
        'open',
        'watch'
    ]);

    /**
     * Build task
     * Run `grunt build` on the command line
     * Then compress all JS/CSS files
     */
    grunt.registerTask('build', [
        'includes',
        'sass:dist',
        //'bower:dist', -> Disable this until found way to include in single file
        'autoprefixer:dist',
        'cssmin:dist',
        'clean:dist',
        'jshint',
        'uglify',
        'usebanner'
    ]);

};
