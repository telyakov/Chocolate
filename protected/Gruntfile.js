/**
 * @desc Grunt settings
 * @see http://gruntjs.com/sample-gruntfile
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
                    '../js/libs/bootstrap-switch/bootstrap-switch.js',
                    '../js/libs/bootstrap-editable.js',
                    '../js/libs/wysihtml5-0.3.0.js',
                    '../js/libs/bootstrap-wysihtml5-0.0.2.js',
                    '../js/libs/wysihtml5.js',
                    '../js/libs/jquery.tablesorter.js',
                    '../js/libs/jquery.tablesorter.widgets.js',
                    '../js/libs/jquery-file-upload/js/vendor/jquery.ui.widget.js',
                    '../js/libs/tmpl.min.js',
                    '../js/libs/jquery-file-upload/js/jquery.fileupload.js',
                    '../js/libs/jquery-file-upload/js/jquery.fileupload-ui.js',
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
                    '../js/libs/backbone/backbone.js',
                    '../js/app/modules/options.js'

                ],
                dest: '../js/erp.js'
            },
            main: {
                src: [

                    '../js/app/modules/mediator.js',
                    '../js/app/modules/table.js',
                    '../js/app/modules/deferred.js',
                    '../js/app/modules/storage.js',
                    '../js/app/modules/user.js',
                    '../js/app/modules/bind.js',
                    '../js/app/modules/helper.js',
                    '../js/app/modules/interpreter.js',
                    '../js/app/modules/image_adapter.js',
                    '../js/app/plugins/wizard.js',
                    '../js/app/modules/log.js',
                    '../js/app/modules/socket.js',
                    '../js/app/modules/menu.js',
                    '../js/app/modules/repaint.js',
                    '../js/app/modules/tabs.js',
                    '../js/app/modules/task_wizard.js',
                    '../js/app/modules/phone.js',
                    '../js/app/fm/action_properties.js',
                    '../js/app/fm/actions_properties_collection.js',
                    '../js/app/fm/agile_filter.js',
                    '../js/app/fm/agile_filters_collections.js',
                    '../js/app/fm/card.js',
                    '../js/app/fm/card_collection.js',
                    '../js/app/fm/column_custom_properties.js',
                    '../js/app/fm/column_properties.js',
                    '../js/app/fm/columns_properties_collection.js',
                    '../js/app/fm/data_form_properties.js',
                    '../js/app/fm/filter_properties.js',
                    '../js/app/fm/print_actions.js',
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
                    '../js/app/models/dynatree/dynatree.js',
                    '../js/app/views/form/*.js',
                    '../js/app/models/form.js',
                    '../js/app/router.js',
                    '../js/app/views/app/app.js',
                    '../js/app/views/dynatree/*.js',
                    '../js/app/views/card/*.js',
                    '../js/app/settings.js',
                    '../js/app/modules/facade.js' //latest loading module
                ],
                dest: '../js/main.js'
            }
        },
        uglify: {
            options: {
                compress: {
                    drop_console: true,
                    global_defs: {
                        PRODUCTION: true
                    }
                }
            },
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
                        '../css/libs/bootstrap-switch.css',
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
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-sftp-deploy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-selenium-webdriver');
    grunt.loadNpmTasks('grunt-exec');
    grunt.registerTask('default', ['exec', 'concat', 'uglify','sass', 'cssmin']); //production version withou tests
    grunt.registerTask('debug', ['exec', 'concat','sass', 'cssmin', 'mochaTest', 'qunit']); // build test && all tests
    grunt.registerTask('build', ['exec', 'concat', 'sass', 'cssmin']); //build test version
    grunt.registerTask('allTest', ['mochaTest', 'qunit']);
    grunt.registerTask('unitTest', ['qunit']);
    grunt.registerTask('funcTest', [ 'selenium_start','mochaTest', 'selenium_stop']);
    grunt.registerTask('deploy', ['sftp-deploy']);
};