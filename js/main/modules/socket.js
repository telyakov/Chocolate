/**
 * Socket module. Using socket.io library https://github.com/Automattic/socket.io-client
 * @param app chApp
 * @param io {Socket}
 * @param optionsModule {optionsModule}
 * @param logModule {logModule}
 * @returns {{facade: facade}}
 */
function socket(app, io, optionsModule, logModule) {
    var connectUrl = optionsModule.getUrl('webSocketServer'),
        socketCon = io.connect(connectUrl, {reconnectionDelay: 3000}),
        _private = {
            connectErrorHandler: function () {
                var $error = $('<div>', {
                    id: 'no-internet',
                    text: optionsModule.getMessage('noConnectWebsocket')
                });

                logModule.showMessage($error);
                socketCon.io.off('connect_error');
                socketCon
                    .off('connect')
                    .on('connect', _private.connectHandler);
            },
            connectHandler: function () {
                $('#no-internet').remove();
                socketCon.off('connect');
                socketCon.io
                    .off('connect_error')
                    .on('connect_error', _private.connectErrorHandler);
            },
            responseHandler: function (data) {
                var error = data.error, mainModule = app.getMain();

                if (error) {
                    mainModule.log.error(error);
                } else {
                    var type = data.type,
                        resData = json_parse(data.data);
                    switch (type) {
                        case optionsModule.getRequestType('roles'):
                            mainModule.user.setRoles(resData);
                            break;
                        case optionsModule.getRequestType('forms'):
                            app.getFunctions().createMenu(resData);
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
            }
        };
    socketCon.io.on('connect_error', _private.connectErrorHandler);
    socketCon
        .on('connect', _private.connectHandler)
        .on('response', _private.responseHandler);

    var channel = optionsModule.getChannel('socketRequest');
    app.getMediator().subscribe(channel, function (data) {
        data.key = optionsModule.getSetting('key');
        socketCon.emit('request', data);
    });

    return {
        facade: function () {
        }
    };
}