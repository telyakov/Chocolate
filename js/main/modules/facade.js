/**
 * Pattern Facade. Documentation: http://largescalejs.ru/the-facade-pattern/
 */
var facade = (function (logModule, mediator, optionsModule, socketModule, storageModule, userModule, menuModule, bindModule, factoryModule, taskWizard) {
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
        }
    };

}(logModule, mediator, optionsModule, socketModule, storageModule, userModule, menuModule, bindModule, factoryModule, taskWizard));