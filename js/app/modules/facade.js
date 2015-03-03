/**
 * Pattern Facade. Documentation: http://largescalejs.ru/the-facade-pattern/
 */
var facade = (function (deferredModule, imageAdapter, AppModel, AppView, Blob, saveAs, logModule, mediator, optionsModule, socketModule, storageModule, userModule, menuModule, bindModule, taskWizard, helpersModule, tableModule, tabsModule, repaintModule, phoneModule) {
    'use strict';

    mediator.subscribe(optionsModule.getChannel('showError'),
        /**
         * @param {String} msg
         */
            function (msg) {
            logModule.showMessage(msg);
        });


    mediator.subscribe(optionsModule.getChannel('logError'),
        /**
         *
         * @param  {...*} args
         */
            function (args) {
            logModule.error(args);
        });

    var requestChannel = optionsModule.getChannel('socketRequest');
    mediator.subscribe(requestChannel,
        /**
         *
         * @param {DTO} data
         */
            function (data) {
            data.key = optionsModule.getSetting('key');
            socketModule.emit('request', data);
        });

    mediator.subscribe(optionsModule.getChannel('socketFileUpload'),
        /**
         *
         * @param {FileDTO} data
         */
            function (data) {
            data.key = optionsModule.getSetting('key');
            socketModule.emit('fileUpload', data);
        });

    mediator.subscribe(optionsModule.getChannel('xmlRequest'),
        /**
         *
         * @param {FileDTO} data
         */
            function (data) {
            data.key = optionsModule.getSetting('key');
            socketModule.emit('xmlRequest', data);
        });

    mediator.subscribe(optionsModule.getChannel('xmlResponse'),
        /**
         *
         * @param {FileDTO} data
         */
            function (data) {

            var asyncTask;
            if (data.id) {
                asyncTask = deferredModule.pop(data.id);
            }

            if (data.error) {
                logModule.error(data.error);
                if (asyncTask) {
                    asyncTask.reject(data.error);
                }
            } else if (data.data && asyncTask) {

                var type = data.type,
                    xml = helpersModule.encodeWinToUnicode(atob(helpersModule.arrayBufferToBase64(data.data))),
                    $xml = $($.parseXML(xml));

                switch (type) {
                    case optionsModule.getRequestType('deferred'):
                        asyncTask.resolve({
                            data: $xml
                        });
                        break;
                    default :
                        asyncTask.reject('Unsupported FileDTO type');
                }
            } else {
                var error = 'property data in FileDTO not set';
                logModule.error(error);
                if (asyncTask) {
                    asyncTask.reject(error);
                }
            }
        });


    mediator.subscribe(optionsModule.getChannel('socketFileRequest'),
        /**
         *
         * @param {FileDTO} data
         */
            function (data) {
            data.key = optionsModule.getSetting('key');
            socketModule.emit('fileRequest', data);
        });

    mediator.subscribe(optionsModule.getChannel('socketExportToExcel'),
        /**
         *
         * @param {ExcelDTO} data
         */
            function (data) {
            socketModule.emit('exportToExcel', data);
        });

    mediator.subscribe(optionsModule.getChannel('socketFileResponse'),
        /**
         *
         * @param {FileDTO} data
         */
            function (data) {
            console.log(data);
            if (data.error) {
                logModule.error({
                        error: data.error,
                        dto: data
                    }
                );
                if(data.id){
                    deferredModule.pop(data.id).reject(error);
                }
            } else if (data.data) {
                switch(data.type){
                    case optionsModule.getRequestType('deferred'):
                        deferredModule.pop(data.id).resolve(data);
                        break;
                    default:
                        logModule.error({
                                error: 'Unsupported requestType',
                                dto: data
                            }
                        );
                }
            } else {
                var errorMessage = 'FileDTO property data not set';
                if(data.id){
                    deferredModule.pop(data.id).reject(errorMessage);
                }

                logModule.error({
                        error: errorMessage,
                        dto: data
                    }
                );
            }
        });

    mediator.subscribe(optionsModule.getChannel('socketMultiplyExec'),
        /**
         *
         * @param {MultiplyExecDTO} data
         */
            function (data) {
            data.key = optionsModule.getSetting('key');
            socketModule.emit('execMultiply', data);
        });

    mediator.subscribe(optionsModule.getChannel('socketResponse'),
        /**
         *
         * @param {DTO} data
         */
            function (data) {
            var deferredType = optionsModule.getRequestType('deferred'),
                refreshType = optionsModule.getRequestType('chFormRefresh'),
                type = data.type,
                asyncTask,
                isCorrectParamsForReject = ([refreshType, deferredType].indexOf(type) !== -1 && data.id);
            if (data.error) {
                logModule.error(data.error);

                if (isCorrectParamsForReject) {
                    asyncTask = deferredModule.pop(data.id);
                    asyncTask.reject(data.error);
                }
            } else if(data.data){
                var parsedData = JSON.parse(data.data);
                switch (type) {
                    case optionsModule.getRequestType('jquery'):
                        var html = helpersModule.getFirstValue(parsedData);
                        $('#' + data.id).html(html);
                        break;

                    case refreshType:
                        var ordersRegExp = /"(.*?)":\{.*?}.?/gim,
                            matches,
                            order = [];
                        while ((matches = ordersRegExp.exec(data.data)) !== null) {
                            order.push(matches[1]);
                        }
                        asyncTask = deferredModule.pop(data.id);
                        asyncTask.resolve({
                            order: order,
                            data: parsedData
                        });
                        break;

                    case deferredType:
                        asyncTask = deferredModule.pop(data.id);
                        asyncTask.resolve({
                            data: parsedData
                        });
                        break;

                    default:
                        asyncTask.reject('Unsupported DTO type');
                }
            }else{
                var error = 'property data in DTO not set';
                logModule.error(error);
                if (isCorrectParamsForReject) {
                    asyncTask = deferredModule.pop(data.id);
                    asyncTask.reject(error);
                }
            }
        });

    mediator.subscribe(optionsModule.getChannel('setIdentity'),
        /**
         *
         * @param {String} id
         * @param {String} employeeId
         * @param {String} name
         */
            function (id, employeeId, name) {
            setTimeout(function () {
                storageModule.saveUser(id, employeeId, name);
                var rolesError = 'An error occurred when trying to get a list of roles';
                bindModule
                    .runAsyncTaskBindSql(optionsModule.getSql('getRoles'))
                    .done(
                    /** @param {SqlBindingResponse} data */
                        function (data) {
                        var asyncTask = deferredModule.create();
                        asyncTask
                            .done(
                            /**
                             *
                             * @param {DeferredResponse} response
                             */
                                function (response) {
                                storageModule.saveRoles(response.data);
                            })
                            .fail(function (error) {
                                logModule.error(error);
                                logModule.showMessage(rolesError);
                            });
                        mediator.publish(requestChannel, {
                            id: deferredModule.save(asyncTask),
                            query: data.sql,
                            type: optionsModule.getRequestType('deferred')
                        });

                    })
                    .fail(function (error) {
                        logModule.error(error);
                        logModule.showMessage(rolesError);
                    });

                var formsError = 'An error occurred when trying to get a list of forms';
                bindModule
                    .runAsyncTaskBindSql(optionsModule.getSql('getForms'))
                    .done(
                    /** @param {SqlBindingResponse} data */
                        function (data) {
                        var asyncTask = deferredModule.create();
                        asyncTask
                            .done(
                            /**
                             *
                             * @param {DeferredResponse} response
                             */
                                function (response) {
                                var data = response.data;
                                menuModule.init(data);
                                storageModule.saveForms(data);
                            })
                            .fail(function (error) {
                                logModule.error(error);
                                logModule.showMessage(formsError);
                            });

                        mediator.publish(requestChannel, {
                            id: deferredModule.save(asyncTask),
                            query: data.sql,
                            type: optionsModule.getRequestType('deferred')
                        });

                    })
                    .fail(function (error) {
                        logModule.error(error);
                        logModule.showMessage(formsError);
                    });
            }, 300);

        });

    mediator.subscribe(optionsModule.getChannel('reflowTab'),
        /**
         *
         * @param {Boolean} force
         */
            function (force) {
            repaintModule.reflowActiveTab(force);
        });

    return {
        getUserModule: function () {
            return userModule;
        },
        getOptionsModule: function () {
            return optionsModule;
        },
        getTaskWizard: function () {
            return taskWizard;
        },
        getHelpersModule: function () {
            return helpersModule;
        },
        getTableModule: function () {
            return tableModule;
        },
        getTabsModule: function () {
            return tabsModule;
        },
        getRepaintModule: function () {
            return repaintModule;
        },
        getPhoneModule: function () {
            return phoneModule;
        },
        getImageAdapter: function () {
            return imageAdapter;
        },
        /**
         *
         * @param {String} userID
         * @param {String} userName
         * @param {String} employeeID
         */
        startApp: function (userID, userName, employeeID) {
            helpersModule.init();
            var appModel = new AppModel({
                    userId: userID,
                    employeeId: employeeID,
                    userName: userName
                }),
                view = new AppView({
                    model: appModel
                });
            view.render();
        }
    };

}(deferredModule, imageAdapter, AppModel, AppView, Blob, saveAs, logModule, mediator, optionsModule, socketModule, storageModule, userModule, menuModule, bindModule, taskWizard, helpersModule, tableModule, tabsModule, repaintModule, phoneModule));