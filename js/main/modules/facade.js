/**
 * Pattern Facade. Documentation: http://largescalejs.ru/the-facade-pattern/
 */
var facade = (function (imageAdapter, navBarModule, AppModel, AppView, Blob, saveAs, json_parse, logModule, mediator, optionsModule, socketModule, storageModule, userModule, menuModule, bindModule, factoryModule, taskWizard, helpersModule, tableModule, tabsModule, repaintModule, filesModule, cardModule, formModule, phoneModule) {
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

    mediator.subscribe(optionsModule.getChannel('openForm'), function (url) {
        helpersModule.openForm(url);
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
        var error = data.error;
        if (error) {
            mediator.publish(
                logErrorChannel,
                error
            );
        } else {
            var type = data.type,
                resData = json_parse(data.data);
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
                case optionsModule.getRequestType('treeControls'):
                    var $el = $('#' + data.id),
                        dnt = new ChDynatree($el);
                    dnt.generateContent($el.data().ChDynatree.options, resData);
                    break;
                case optionsModule.getRequestType('chFormRefresh'):
                    var form = factoryModule.makeChGridForm($('#' + data.id)),
                        reg = /"(.*?)":\{.*?\}.?/gim,
                        matches,
                        order = [];
                    while ((matches = reg.exec(data.data)) !== null) {
                        order.push(matches[1]);
                    }
                    form.updateData(resData, order);
                    break;
                default:
                    console.log(data);
            }
        }
    });

    mediator.subscribe(optionsModule.getChannel('setIdentity'), function (id, name) {
        storageModule.saveUser(id, name);
        var rolesSql = bindModule.bindSql(optionsModule.getSql('getRoles')),
            formsSql = bindModule.bindSql(optionsModule.getSql('getForms'));
        mediator.publish(requestChannel, {
            query: rolesSql,
            type: optionsModule.getRequestType('roles')
        });
        mediator.publish(requestChannel, {
            query: formsSql,
            type: optionsModule.getRequestType('forms')
        });
    });
    mediator.subscribe(setRolesChannel, function (roles) {
        storageModule.saveRoles(roles);
    });

    mediator.subscribe(optionsModule.getChannel('reflowTab'), function () {
        repaintModule.reflowActiveTab();
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
        getImageAdapter: function(){
            return imageAdapter;
        },
        startApp: function (userID, userName) {
            helpersModule.init();
            var appModel = new AppModel({
                    userId: userID,
                    userName: userName
                }),
                view = new AppView({
                    model: appModel,
                    el: $('body')
                });
            ChocolateEvents.createEventsHandlers();
        }
    };

}(imageAdapter, navBarModule, AppModel, AppView, Blob, saveAs, json_parse, logModule, mediator, optionsModule, socketModule, storageModule, userModule, menuModule, bindModule, factoryModule, taskWizard, helpersModule, tableModule, tabsModule, repaintModule, filesModule, cardModule, formModule, phoneModule));