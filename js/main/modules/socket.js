/**
 * Socket module. Based on socket.io library
 * https://github.com/Automattic/socket.io-client
 * @param io {Socket}
 * @param optionsModule {optionsModule}
 * @param mediator {mediator}
 */
var socketModule = (function socket(io, optionsModule, mediator) {
    var connectUrl = optionsModule.getUrl('webSocketServer'),
        socketCon = io.connect(connectUrl, {reconnectionDelay: 3000}),
        _private = {
            connectErrorHandler: function () {
                mediator.publish(
                    optionsModule.getChannel('showError'),
                    optionsModule.getMessage('noConnectWebsocket')
                );
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
                mediator.publish(
                    optionsModule.getChannel('socketResponse'),
                    data
                );
            }
        };
    socketCon.io.on('connect_error', _private.connectErrorHandler);
    socketCon
        .on('connect', _private.connectHandler)
        .on('response', _private.responseHandler);
    return {
        emit: function(event, data){
            socketCon.emit(event, data);
        }
    };
})(io,optionsModule, mediator);