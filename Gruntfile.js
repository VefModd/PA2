module.exports = function ( grunt ) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            src: ['src/**/*.js'],
            gruntfile: ['Gruntfile.js'],
            options: {
                curly:  true,
                immed:  true,
                newcap: true,
                noarg:  true,
                sub:    true,
                boss:   true,
                eqnull: true,
                node:   true,
                undef:  true,
                globals: {
                    _:       false,
                    jQuery:  false,
                    angular: false,
                    moment:  false,
                    console: false,
                    $:       false,
                    io:      false
                }
            }
        },
        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ';'
            },
            dist: {
                // the files to concatenate
                src: ['src/js/**/*.js'],
                // the location of the resulting JS file
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
            // Keep variable names
            mangle: false,
            // the banner is inserted at the top of the output
            banner: '/*! Angular Chat, Nonni Danni Jorri  <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/angularchat.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'concat', 'uglify']
        }
    });
};
