/**
 * Pattern Facade. Documentation: http://largescalejs.ru/the-facade-pattern/
 */
var facade = (function (deferredModule, imageAdapter, navBarModule, AppModel, AppView, Blob, saveAs, json_parse, logModule, mediator, optionsModule, socketModule, storageModule, userModule, menuModule, bindModule, factoryModule, taskWizard, helpersModule, tableModule, tabsModule, repaintModule, filesModule, cardModule, formModule, phoneModule) {
    'use strict';
    var showErrorsChannel = optionsModule.getChannel('showError'),
        setRolesChannel = optionsModule.getChannel('setRoles'),
        logErrorChannel = optionsModule.getChannel('logError');
    mediator.subscribe(showErrorsChannel, function (msg) {
        logModule.showMessage(msg);
    });
    mediator.subscribe(logErrorChannel, function (args) {
        logModule.error(args);
    });

    var requestChannel = optionsModule.getChannel('socketRequest');
    mediator.subscribe(requestChannel, function (data) {
        data.key = optionsModule.getSetting('key');
        socketModule.emit('request', data);
    });

    mediator.subscribe(optionsModule.getChannel('xmlRequest'), function (data) {
        data.key = optionsModule.getSetting('key');
        socketModule.emit('xmlRequest', data);
    });
    mediator.subscribe(optionsModule.getChannel('xmlResponse'), function (data) {
        if (data.error) {
            mediator.publish(
                logErrorChannel,
                data.error
            );
        } else {

            if (data.data) {
                var type = data.type,
                    xml = helpersModule.winToUnicode(atob(data.data)),
                    $xml = $($.parseXML(xml));
                switch (type) {
                    case optionsModule.getRequestType('mainForm'):
                        var model = new FormModel({
                            $xml: $xml
                        });
                        var view = new FormView({
                            model: model,
                            $el: $('#tabs')
                        });
                        break;
                    case optionsModule.getRequestType('deferred'):
                        var defer = deferredModule.pop(data.id);
                        defer.resolve({
                            data: $xml
                        });
                        break;
                    default :
                        break;

                }
            }
        }
    });
    mediator.subscribe(optionsModule.getChannel('socketFileRequest'), function (data) {
        data.key = optionsModule.getSetting('key');
        socketModule.emit('fileRequest', data);
    });

    mediator.subscribe(optionsModule.getChannel('openForm'), function (opts) {
        var $el = opts.$el,
            card = opts.card,
            view = opts.view,
            parentModel = opts.parentModel,
            parentID = opts.parentID;
        if(view.indexOf('.xml') === -1){
            view = view + '.xml';
        }
        view = view.replace(/\\/g, '/');
        var defer = deferredModule.create(),
            deferID = deferredModule.save(defer);
        var data = {
            key: optionsModule.getSetting('key'),
            type: optionsModule.getRequestType('deferred'),
            name: view,
            id: deferID
        };
    socketModule.emit('xmlRequest', data);
        defer.done(function(res){
            var $xml = res.data;
            var model = new FormModel({
                $xml: $xml,
                parentModel: parentModel,
                parentId: parentID
            });
            var view = new FormView({
                model: model,
                $el: $el,
                card: card
            });
        });
    });

    mediator.subscribe(optionsModule.getChannel('socketFileResponse'), function (data) {
        if (data.error) {
            mediator.publish(
                logErrorChannel,
                data.error
            );
        } else {
            if (data.data) {
                //https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript/16245768#16245768?newreg=b55ed913d6004b79b3a7729fc72a9aad
                var byteCharacters = atob(data.data),
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
    var responseChannel = optionsModule.getChannel('socketResponse');
    mediator.subscribe(responseChannel, function (data) {
        var error = data.error,
            deferredType = optionsModule.getRequestType('deferred'),
            type = data.type,
            defer;
        if (error) {
            mediator.publish(
                logErrorChannel,
                error
            );
            if (type === deferredType) {
                defer = deferredModule.pop(data.id);
                defer.resolve();
            }

        } else {
            var resData = json_parse(data.data);
            switch (type) {
                case optionsModule.getRequestType('roles'):
                    mediator.publish(setRolesChannel, resData);
                    break;
                case optionsModule.getRequestType('forms'):
                    menuModule.init(resData);
                    break;
                case optionsModule.getRequestType('jquery'):
                    var value = socketModule.getFirstValue(resData);
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
                        data:  resData
                    });
                    //form.updateData(resData, order);
                    break;
                case deferredType:
                    defer = deferredModule.pop(data.id);
                    var isAllow = !!parseInt(socketModule.getFirstValue(resData), 10);
                    defer.resolve({
                        value:isAllow,
                        data:  resData
                    });
                    break;
                default:
                    console.log(data);
            }
        }
    });

    mediator.subscribe(optionsModule.getChannel('setIdentity'), function (id, employeeId, name) {
        storageModule.saveUser(id,employeeId,  name);
        var rolesDefer  = bindModule.deferredBindSql(optionsModule.getSql('getRoles')),
            formsDefer = bindModule.deferredBindSql(optionsModule.getSql('getForms'));
        rolesDefer.done(function (data) {
            var rolesSql = data.sql;
            mediator.publish(requestChannel, {
                query: rolesSql,
                type: optionsModule.getRequestType('roles')
            });
        });
        formsDefer.done(function (data) {
            var formsSql = data.sql;
            mediator.publish(requestChannel, {
                query: formsSql,
                type: optionsModule.getRequestType('forms')
            });
        });
    });
    mediator.subscribe(setRolesChannel, function (roles) {
        storageModule.saveRoles(roles);
    });

    mediator.subscribe(optionsModule.getChannel('reflowTab'), function (force) {
        repaintModule.reflowActiveTab(force);
    });

    return {
        getUserModule: function () {
            return userModule;
        },
        getLogModule: function () {
            return logModule;
        },
        getOptionsModule: function () {
            return optionsModule;
        },
        getBindModule: function () {
            return bindModule;
        },
        getFactoryModule: function () {
            return factoryModule;
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
        getFilesModule: function () {
            return filesModule;
        },
        getCardModule: function () {
            return cardModule;
        },
        getFormModule: function () {
            return formModule;
        },
        getPhoneModule: function () {
            return phoneModule;
        },
        getNavBarModule: function () {
            return navBarModule;
        },
        getImageAdapter: function () {
            return imageAdapter;
        },
        startApp: function (userID, userName, $employeeID) {
            helpersModule.init();
            var appModel = new AppModel({
                    userId: userID,
                    employeeId: $employeeID,
                    userName: userName
                }),
                view = new AppView({
                    model: appModel,
                   $el: $('body')
                });
        }
    };

}(deferredModule, imageAdapter, navBarModule, AppModel, AppView, Blob, saveAs, json_parse, logModule, mediator, optionsModule, socketModule, storageModule, userModule, menuModule, bindModule, factoryModule, taskWizard, helpersModule, tableModule, tabsModule, repaintModule, filesModule, cardModule, formModule, phoneModule));