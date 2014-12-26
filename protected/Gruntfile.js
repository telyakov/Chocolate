/*
    Grunt settings
    http://gruntjs.com/sample-gruntfile
*/
module.exports = function (grunt) {
    grunt.initConfig({
        concat: {
            options: {
                separator: ';'
            },
            libs: {
                src: [
                    '../js/libs/jquery/jquery.js',
                    '../js/libs/jquery-ui/jquery-ui.js',
                    '../js/libs/jquery.dragtable.js',
                    '../js/libs/jquery-ui-contextmenu/index.js',
                    '../js/libs/lodash/lodash.js',
                    '../js/libs/jquery.floatThead.js',
                    '../js/libs/bootstrap.js',
                    '../js/libs/dynatree/dist/jquery.dynatree.js',
                    '../js/libs/bootstrap-datetimepicker.js',
                    '../js/libs/toggle-buttons/index.js',
                    '../js/libs/bootstrap-editable.js',
                    '../js/libs/wysihtml5-0.3.0.js',
                    '../js/libs/bootstrap-wysihtml5-0.0.2.js',
                    '../js/libs/wysihtml5.js',
                    '../js/libs/jquery.tablesorter.js',
                    '../js/libs/jquery.tablesorter.widgets.js',
                    '../js/libs/json_parse/index.js',
                    '../js/libs/jquery-file-upload/js/vendor/jquery.ui.widget.js',
                    '../js/libs/tmpl.min.js',
                    '../js/libs/jquery-file-upload/js/jquery.fileupload.js',
                    '../js/libs/jquery-file-upload/js/jquery.fileupload-ui.js',
                    '../js/libs/fileDownload/index.js',
                    '../js/libs/fancyBox/index.js',
                    '../js/libs/throttle-debounce/index.js',
                    '../js/libs/classie/index.js',
                    '../js/libs/gnmenu.js',
                    '../js/libs/ui-touch-punch/index.js', // for ipad, resize support,
                    '../js/libs/socket.io/index.js',
                    '../js/libs/log4javascript/index.js',
                    '../js/libs/moment/moment.js',
                    '../js/libs/FileSaver/FileSaver.js',
                    '../js/libs/Blob/index.js',
                    '../js/libs/backbone/backbone.js'

                ],
                dest: '../js/erp.js'
            },
            main: {
                src: [
                    '../js/app/modules/options.js',
                    '../js/main/modules/mediator.js',
                    '../js/main/modules/table.js',
                    '../js/main/modules/form.js',
                    '../js/app/modules/deferred.js',
                    '../js/main/static/ChResponseStatus.js',
                    '../js/main/classes/ch.dynatree.js',
                    '../js/main/classes/ch.map.js',
                    '../js/main/classes/ch.tab.js',
                    '../js/main/classes/ch.messages.container.js',
                    '../js/main/classes/response/ch.response.js',
                    '../js/main/classes/response/ch.grid.response.js',
                    '../js/main/classes/ch.filter.form.js',
                    '../js/main/classes/ch.filter.js',
                    '../js/main/classes/ch.grid.form.js',
                    '../js/main/classes/ch.canvas.options.js',
                    '../js/main/classes/ch.canvas.js',
                    '../js/main/modules/storage.js',
                    '../js/main/modules/user.js',
                    '../js/main/modules/bind.js',
                    '../js/main/static/chocolate.js',
                    '../js/main/chApp.js',
                    '../js/main/plugins/wizard.js',
                    '../js/main/modules/log.js',
                    '../js/main/modules/socket.js',
                    '../js/main/modules/menu.js',
                    '../js/main/modules/factory.js',
                    '../js/main/modules/repaint.js',
                    '../js/main/modules/card.js',
                    '../js/main/modules/tabs.js',
                    '../js/main/modules/task_wizard.js',
                    '../js/main/modules/files.js',
                    '../js/main/modules/phone.js',
                    '../js/app/fm/*.js',
                    '../js/app/models/filter/filter_ro.js',
                    '../js/app/models/filter/*.js',
                    '../js/app/models/card/card_element.js',
                    '../js/app/models/card/*.js',
                    '../js/app/models/column/column_ro.js',
                    '../js/app/models/column/*.js',
                    '../js/app/views/filter/filter.js',
                    '../js/app/views/filter/*.js',
                    '../js/app/views/column/*.js',
                    '../js/app/models/app.js',
                    '../js/app/models/form.js',
                    '../js/app/router.js',
                    '../js/app/views/app/app.js',
                    '../js/app/views/form/*.js',
                    '../js/app/views/card/*.js',
                    '../js/app/modules/nav_bar.js',
                    '../js/app/modules/image_adapter.js',
                    '../js/main/settings.js',
                    '../js/main/modules/facade.js' //latest loading module

                ],
                dest: '../js/main.js'
            }
        },
        uglify: {
            main: {
                files: {
                    '../js/erp.min.js': ['../js/erp.js']
                }
            }
        },
        cssmin: {
            combine: {
                files: {
                    '../css/libs/erp.css': [
                        '../css/libs/font-awersome.css',
                        '../css/libs/jquery.fancybox.css',
                        '../css/libs/ui.dynatree.css',
                        '../css/libs/bootstrap.min.css',
                        '../css/libs/bootstrap-toggle-buttons.css',
                        '../css/libs/jquery.fileupload-ui.css',
                        '../css/libs/bootstrap-editable.css',
                        '../css/libs/datetimepicker.css',
                        '../css/libs/jquery-ui-bootstrap.css',
                        '../css/libs/bootstrap-wysihtml5-0.0.2.css',
                        '../css/libs/wysiwyg-color.css',
                        '../css/libs/component.css'
                    ]
                },
                minify: {
                    expand: true,
                    cwd: '../css/libs/',
                    src: ['erp.css']
                }
            }
        },
        qunit: {

            urls: {
                options: {
                    urls: [
                        'http://localhost/js/tests/unit.html'
                    ]
                }
//                ,
//                connect:{
//                    server:{
//                        options:{
//                            port: 80
//                        }
//                    }
//                }
            }
        },
        mochaTest: {
            //required started selenuim
            test: {
                options: {
                    timeout: 5000
//                    clearRequireCache: true

//                    'reporter': 'xunit',
//                    'output': 'result.xml',
//                    log: true,
//                    'c': false
                },
                src: ['../js/tests/functional/*.js']
            }
        },
        bower: {
            update: {
                options:{
                    targetDir: '../js/libs/'
                }
            }
        },
        'sftp-deploy': {
            build: {
                auth: {
                    host: '192.168.0.34',
                    port: 22,
                    authKey: 'key1'
                },
                src: '../js',
                exclusions: ['../js/libs', '../js/main', '../js/tests'],
                dest: '/vagrant/js',
                serverSep: '/',
                concurrency: 4,
                progress: true
            }
        },

        sass: {
            //required installed ruby && sass
            dist: {
                options: {
                    sourcemap: 'none',
                    style: 'compact'
                },
                files: {
                    '../css/main.css': '../css/main.scss'
                }
            }
        },
        exec: {
            echo_something: 'rm ../js/main.js ../js/erp.js ../css/main.css ../css/libs/erp.css'
        }
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-sftp-deploy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-selenium-webdriver');
    grunt.loadNpmTasks('grunt-exec');
    grunt.registerTask('default', ['concat', 'uglify','sass', 'cssmin']); //production version withou tests
    grunt.registerTask('debug', ['exec', 'concat','sass', 'cssmin', 'mochaTest', 'qunit']); // build test && all tests
    grunt.registerTask('build', ['exec', 'concat', 'sass', 'cssmin']); //build test version
    grunt.registerTask('allTest', ['mochaTest', 'qunit']);
    grunt.registerTask('unitTest', ['qunit']);
    grunt.registerTask('funcTest', [ 'selenium_start','mochaTest', 'selenium_stop']);
    grunt.registerTask('deploy', ['sftp-deploy']);
};