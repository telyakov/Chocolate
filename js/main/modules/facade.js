/**
 * Pattern Facade. Documentation: http://largescalejs.ru/the-facade-pattern/
 */
var facade = (function (logModule, mediator, optionsModule, socketModule, storageModule, userModule, menuModule, bindModule, factoryModule, taskWizard, helpersModule, tableModule, tabsModule, repaintModule, filesModule, cardModule, formModule) {
    var showErrorsChannel = optionsModule.getChannel('showError'),
        setRolesChannel = optionsModule.getChannel('setRoles'),
        logErrorChannel =  optionsModule.getChannel('logError');
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
                    var firstRow;
                    for (var i in resData) {
                        if (resData.hasOwnProperty(i)) {
                            firstRow = resData[i];
                            break;
                        }
                    }
                    var $elem = $('#' + data.id);
                    for (var j in firstRow) {
                        if (firstRow.hasOwnProperty(j)) {
                            $elem.html(firstRow[j]);
                            break;
                        }
                    }
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
        getUserModule: function(){
            return userModule;
        },
        getLogModule: function(){
            return logModule;
        },
        getOptionsModule: function(){
            return optionsModule;
        },
        getBindModule: function(){
            return bindModule;
        },
        getFactoryModule: function(){
            return factoryModule;
        },
        getTaskWizard: function(){
            return taskWizard;
        },
        getHelpersModule: function(){
            return helpersModule;
        },
        getTableModule: function(){
            return tableModule;
        },
        getTabsModule: function(){
            return tabsModule;
        },
        getRepaintModule: function(){
            return repaintModule;
        },
        getFilesModule: function(){
            return filesModule;
        },
        getCardModule: function(){
            return cardModule;
        },
        getFormModule: function(){
            return formModule;
        }
    };

}(logModule, mediator, optionsModule, socketModule, storageModule, userModule, menuModule, bindModule, factoryModule, taskWizard, helpersModule, tableModule, tabsModule, repaintModule, filesModule, cardModule, formModule));