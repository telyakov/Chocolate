/**
 * Pattern Facade. Documentation: http://largescalejs.ru/the-facade-pattern/
 */
var facade = (function (logModule, mediator, optionsModule, socketModule, storageModule) {
    var showErrorsChannel = optionsModule.getChannel('showError'),
        setRolesChannel = optionsModule.getChannel('setRoles');
    mediator.subscribe(showErrorsChannel, function (msg) {
        logModule.showMessage(msg);
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
                optionsModule.getChannel('logError'),
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
                    chApp.getFunctions().createMenu(resData);
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
        console.log('setIdentity');
        storageModule.saveUser(id, name);
        var bindModule = chApp.getBindService();
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


}(logModule, mediator, optionsModule, socketModule, storageModule));