/**
 * Pattern Facade. Documentation: http://largescalejs.ru/the-facade-pattern/
 */
var facade = (function(logModule, mediator, optionsModule, socketModule) {
    var showErrorsChannel = optionsModule.getChannel('showError');
    mediator.subscribe(showErrorsChannel, function(msg){
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
                    var mainModule = chApp.getMain(),
                        type = data.type,
                        resData = json_parse(data.data);
                    switch (type) {
                        case optionsModule.getRequestType('roles'):
                            mainModule.user.setRoles(resData);
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

}(logModule, mediator, optionsModule, socketModule));