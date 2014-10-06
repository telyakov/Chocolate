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
                    '../js/libs/jquery.dynatree.min.js',
                    '../js/libs/bootstrap-datetimepicker.js',
                    '../js/libs/toggle-buttons/index.js',
                    '../js/libs/bootstrap-editable.js',
                    '../js/libs/wysihtml5-0.3.0.js',
                    '../js/libs/bootstrap-wysihtml5-0.0.2.js',
                    '../js/libs/wysihtml5.js',
                    '../js/libs/jquery.tablesorter.js',
                    '../js/libs/jquery.tablesorter.widgets.js',
//                    '../js/libs/date.format.js',
                    '../js/libs/json_parse/index.js',
                    '../js/libs/jquery.ui.widget.js',
                    '../js/libs/tmpl.min.js',
                    '../js/libs/jquery.fileupload.js',
                    '../js/libs/jquery.fileupload-ui.js',
                    '../js/libs/jquery.fileupload-locale.js',
                    '../js/libs/fileDownload/index.js',
                    '../js/libs/jquery.fancybox.js',
                    '../js/libs/throttle-debounce/index.js',
                    '../js/libs/classie/index.js',
                    '../js/libs/gnmenu.js',
                    '../js/libs/ui-touch-punch/index.js', // for ipad, resize support,
//                    '../js/libs/socket.io/index.js',
                    '../js/libs/log4javascript/index.js',
                    '../js/libs/moment/moment.js'
                ],
                dest: '../js/erp.js'
            },
            main: {
                src: [
                    '../js/main/static/ObjectStorage.js',
                    '../js/main/static/ChOptions.js',
                    '../js/main/static/ChObjectStorage.js',
                    '../js/main/static/ch.table.helper.js',
                    '../js/main/static/ChEditableCallback.js',
                    '../js/main/static/ChCardInitCallback.js',
                    '../js/main/static/chAttachments.js',
                    '../js/main/static/ChResponseStatus.js',
                    '../js/main/static/chAjaxQueue.js',
                    '../js/main/static/ChTabHistory.js',
                    '../js/main/classes/ch.dynatree.js',
                    '../js/main/classes/ch.map.js',
                    '../js/main/classes/ch.tab.js',
                    '../js/main/classes/ch.messages.container.js',
                    '../js/main/classes/response/ch.response.js',
                    '../js/main/classes/response/ch.grid.response.js',
                    '../js/main/classes/response/ch.search.response.js',
                    '../js/main/classes/response/ch.packageResponse.js',
                    '../js/main/classes/ch.table.js',
                    '../js/main/classes/chDiscussionForm.js',
                    '../js/main/classes/ch.filter.form.js',
                    '../js/main/classes/elements/ch.grid.column.header.js',
                    '../js/main/classes/elements/ch.grid.column.body.js',
                    '../js/main/classes/elements/ch.card.element.js',
                    '../js/main/classes/elements/ch.GridColumn.js',
                    '../js/main/classes/ch.filter.js',
                    '../js/main/classes/ch.form.settings.js',
                    '../js/main/classes/ch.grid.form.js',
                    '../js/main/classes/ch.card.js',
                    '../js/main/static/chocolate.draw.js',
                    '../js/main/classes/ch.canvas.options.js',
                    '../js/main/classes/ch.canvas.js',
                    '../js/main/classes/elements/ch.editable.js',
                    '../js/main/classes/elements/ch.text.area.editable.column.js',
                    '../js/main/classes/elements/ch.text.area.editable.card.js',
                    '../js/main/framework/fm.cardsCollection.js',
                    '../js/main/framework/fm.ChildGridCollection.js',
                    '../js/main/static/chocolate.js',
                    '../js/main/static/bindingService.js',
                    '../js/main/static/ChocolateEvents.js',
                    '../js/main/functions/ch.cardFunctions.js',
                    '../js/main/functions/ch.functions.js',
                    '../js/main/majestic/majestic.vars.js',
                    '../js/main/majestic/majestic.method.js',
                    '../js/main/majestic/clear_vars_method.js',
                    '../js/main/majestic/set_var_method.js',
                    '../js/main/majestic/get_active_row_id_method.js',
                    '../js/main/majestic/remove_var_method.js',
                    '../js/main/majestic/majestic_method_factory.js',
                    '../js/main/majestic/majestic.expression.js',
                    '../js/main/majestic/majestic.interpreter.js',
                    '../js/main/majestic/majestic.wizard_method.js',
                    '../js/main/majestic/majestic.queue.js',
                    '../js/main/majestic/majestic.wizard.js',
                    '../js/main/majestic/task_wizard.js',
                    '../js/main/majestic/select_service_task_step.js',
                    '../js/main/majestic/select_executors_task_step.js',
                    '../js/main/majestic/select_description_task_step.js',
                    '../js/main/functions/open_wizard_dialog.js',
                    '../js/main/functions/open_task_wizard_dialog_end.js',
                    '../js/main/chApp.js',
                    '../js/main/run.js'
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
                    timeout: 5000,
                    reporter: 'spec'
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
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-selenium-webdriver');
    grunt.loadNpmTasks('grunt-exec');
    grunt.registerTask('default', ['concat', 'uglify','sass', 'cssmin']); //production version withou tests
    grunt.registerTask('debug', ['exec', 'concat','sass', 'cssmin', 'mochaTest', 'qunit']); // build test && all tests
    grunt.registerTask('build', ['exec', 'concat', 'sass', 'cssmin']); //build test version
    grunt.registerTask('allTest', ['mochaTest', 'qunit']);
    grunt.registerTask('unitTest', ['qunit']);
    grunt.registerTask('funcTest', [ 'selenium_phantom_hub','mochaTest', 'selenium_stop']);
//    grunt.registerTask('funcTest', [ 'mochaTest']);
};