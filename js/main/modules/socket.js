/**
 * Socket module. Based on socket.io library
 * https://github.com/Automattic/socket.io-client
 * @param io {Socket}
 * @param optionsModule {optionsModule}
 * @param mediator {mediator}
 */
var socketModule = (function (io, optionsModule, mediator) {
    var connectUrl = optionsModule.getUrl('webSocketServer'),
        socket = io.connect(connectUrl, {reconnectionDelay: 3000}),
        _private = {
            connectErrorHandler: function () {
                mediator.publish(
                    optionsModule.getChannel('showError'),
                    optionsModule.getMessage('noConnectWebsocket')
                );
                socket.io.off('connect_error');
                socket
                    .off('connect')
                    .on('connect', _private.connectHandler);
            },
            connectHandler: function () {
                $('#no-internet').remove();
                socket.off('connect');
                socket.io
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
    socket.io.on('connect_error', _private.connectErrorHandler);
    socket
        .on('connect', _private.connectHandler)
        .on('response', _private.responseHandler);
    return {
        emit: function(event, data){
            socket.emit(event, data);
        }
    };
})(io,optionsModule, mediator);