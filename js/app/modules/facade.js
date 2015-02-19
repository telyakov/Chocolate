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
                        break;
                }
            } else {
                var error = 'property data in FileDTO not set';
                logModule.error(error);
                if (asyncTask) {
                    asyncTask.reject(error);
                }
            }
        });

    mediator.subscribe(optionsModule.getChannel('socketFileRequest'), function (data) {
        data.key = optionsModule.getSetting('key');
        socketModule.emit('fileRequest', data);
    });
    mediator.subscribe(optionsModule.getChannel('socketExportToExcel'), function (data) {
        socketModule.emit('exportToExcel', data);
    });
    mediator.subscribe(optionsModule.getChannel('openForm'), function (opts) {
        var card = opts.card,
            view = opts.view,
            parentModel = opts.parentModel,
            parentID = opts.parentID;
        view = helpersModule.getCorrectXmlName(view);
        var defer = deferredModule.create(),
            deferID = deferredModule.save(defer);
        var data = {
            key: optionsModule.getSetting('key'),
            type: optionsModule.getRequestType('deferred'),
            name: view,
            id: deferID
        };
        socketModule.emit('xmlRequest', data);
        defer.done(function (res) {
            var $xml = res.data;
            var model = new FormModel({
                $xml: $xml,
                parentModel: parentModel,
                parentId: parentID
            });
            var view = new FormView({
                $card: opts.$el,
                model: model,
                card: card
            });
            view.render()
        });
    });

    mediator.subscribe(optionsModule.getChannel('socketFileResponse'), function (data) {
        if (data.error) {
            logModule.error(data.error);
        } else {
            if (data.data) {
                //https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript/16245768#16245768?newreg=b55ed913d6004b79b3a7729fc72a9aad
                var byteCharacters = atob(helpersModule.arrayBufferToBase64(data.data)),
                    charactersLength = byteCharacters.length,
                    byteArrays = [],
                    sliceSize = 512,
                    offset,
                    slice,
                    sliceLength,
                    byteNumbers,
                    i;

                for (offset = 0; offset < charactersLength; offset += sliceSize) {
                    slice = byteCharacters.slice(offset, offset + sliceSize);
                    sliceLength = slice.length;
                    byteNumbers = new Array(sliceLength);
                    for (i = 0; i < sliceLength; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }
                    byteArrays.push(new Uint8Array(byteNumbers));
                }
                saveAs(new Blob(byteArrays, {}), data.name);
            }
        }
    });

    mediator.subscribe(optionsModule.getChannel('socketMultiplyExec'), function (data) {
        data.key = optionsModule.getSetting('key');
        socketModule.emit('execMultiply', data);
    });
    var responseChannel = optionsModule.getChannel('socketResponse');
    mediator.subscribe(responseChannel, function (data) {
        var error = data.error,
            deferredType = optionsModule.getRequestType('deferred'),
            type = data.type,
            defer;
        if (error) {
            logModule.error(error);

            if (type === deferredType) {
                defer = deferredModule.pop(data.id);
                defer.reject(error);
            }
        } else {
            var resData = JSON.parse(data.data);
            switch (type) {
                case optionsModule.getRequestType('roles'):
                    storageModule.saveRoles(resData);
                    break;
                case optionsModule.getRequestType('forms'):
                    menuModule.init(resData);
                    storageModule.saveForms(resData);
                    break;
                case optionsModule.getRequestType('jquery'):
                    var value = helpersModule.getFirstValue(resData);
                    $('#' + data.id).html(value);
                    break;
                case optionsModule.getRequestType('wizardServices'):
                    taskWizard.onServiceCommand(resData, data.id);
                    break;
                case optionsModule.getRequestType('wizardExecutors'):
                    taskWizard.onExecutorsCommand(resData, data.id);
                    break;
                case optionsModule.getRequestType('chFormRefresh'):
                    //todo: migrate ro defer
                    var reg = /"(.*?)":\{.*?\}.?/gim,
                        matches,
                        order = [];
                    while ((matches = reg.exec(data.data)) !== null) {
                        order.push(matches[1]);
                    }
                    defer = deferredModule.pop(data.id);
                    defer.resolve({
                        order: order,
                        data: resData
                    });
                    //form.updateData(resData, order);
                    break;
                case deferredType:
                    defer = deferredModule.pop(data.id);
                    var isAllow = !!parseInt(helpersModule.getFirstValue(resData), 10);
                    defer.resolve({
                        value: isAllow,
                        data: resData
                    });
                    break;
                default:
                    console.log(data);
            }
        }
    });

    mediator.subscribe(optionsModule.getChannel('setIdentity'),
        /**
         *
         * @param {Number} id
         * @param {Number} employeeId
         * @param {String} name
         */
            function (id, employeeId, name) {
            setTimeout(function () {
                storageModule.saveUser(id, employeeId, name);
                bindModule
                    .runAsyncTaskBindSql(optionsModule.getSql('getRoles'))
                    .done(
                    /** @param {SqlBindingResponse} data */
                        function (data) {
                        var rolesSql = data.sql;
                        mediator.publish(requestChannel, {
                            query: rolesSql,
                            type: optionsModule.getRequestType('roles')
                        });
                    });
                bindModule
                    .runAsyncTaskBindSql(optionsModule.getSql('getForms'))
                    .done(function (data) {
                        var formsSql = data.sql;
                        mediator.publish(requestChannel, {
                            query: formsSql,
                            type: optionsModule.getRequestType('forms')
                        });
                    });
            }, 300);

        });

    mediator.subscribe(optionsModule.getChannel('reflowTab'), function (force) {
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