/**
 * Socket module. Based on socket.io library
 * https://github.com/Automattic/socket.io-client
 */
var socketModule = (function (io, optionsModule, mediator) {
    'use strict';
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
            },
            getItemByIndex: function (obj, rowIndex, colIndex) {
                var i,
                    j,
                    hasOwn = Object.prototype.hasOwnProperty,
                    result,
                    row,
                    counter = 0;
                for (i in obj) {
                    if (hasOwn.call(obj, i)) {
                        if (counter === rowIndex) {
                            row = obj[i];
                            break;
                        }
                        counter++;
                    }
                }
                counter = 0;
                for (j in row) {
                    if (hasOwn.call(row, j)) {
                        if (counter === colIndex) {
                            result = row[j];
                            break;
                        }
                        counter++;
                    }
                }
                return result;
            }
        };
    socket.io.on('connect_error', _private.connectErrorHandler);
    socket
        .on('connect', _private.connectHandler)
        .on('response', _private.responseHandler)
        .on('fileResponse', function (data) {
            mediator.publish(
                optionsModule.getChannel('socketFileResponse'),
                data
            );
        })
        .on('xmlResponse', function(data){
            mediator.publish(
                optionsModule.getChannel('xmlResponse'),
                data
            );        });
    return {
        emit: function (event, data) {
            socket.emit(event, data);
        },
        getFirstValue: function (obj) {
            return _private.getItemByIndex(obj, 0, 0);
        }

    };
})(io, optionsModule, mediator);
