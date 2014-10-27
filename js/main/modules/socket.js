/**
 * @param app chApp
 * @returns {{facade: facade}}
 */
function socket(app) {
    var optionsModule = app.getOptions(),
        socketCon = io.connect(optionsModule.urls.webSocketServer, {reconnectionDelay: 3000}),
        _private = {
            connectErrorHandler: function () {
                var $error = $('<div>', {
                    id: 'no-internet',
                    text: app.getMessages().noConnectWebsocket
                });
                app.getMain().$page.append($error);
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
                        case optionsModule.sql.types.roles:
                            mainModule.user.setRoles(resData);
                            break;
                        case optionsModule.sql.types.forms:
                            app.getFunctions().createMenu(resData);
                            break;
                        case optionsModule.sql.types.jquery:
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

    var channel = optionsModule.channels.socketRequest;
    app.getMediator().subscribe(channel, function (data) {
        data.key = optionsModule.settings.key;
        socketCon.emit('request', data);
    });

    return {
        facade: function () {
        }
    };
}