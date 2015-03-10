/**
 * Socket module. Based on socket.io library
 * https://github.com/Automattic/socket.io-client
 * Все взаимодействие с MilkyWay(Базой данных) происходит здесь.
 */
var socketModule = (function (io, optionsModule) {
    'use strict';
    var connectUrl = optionsModule.getUrl('webSocketServer'),
        socket = io.connect(connectUrl, {reconnectionDelay: 3000, timeout: 15000}),
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
            /**
             *
             * @param {DTO} data
             */
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
        .on('response', _private.responseHandler)
        .on('fileResponse',
        /**
         *
         * @param {FileDTO} data
         */
        function (data) {
            mediator.publish(
                optionsModule.getChannel('socketFileResponse'),
                data
            );
        })
        .on('xmlResponse', function (data) {
            mediator.publish(
                optionsModule.getChannel('xmlResponse'),
                data
            );
        });

    return {
        /**
         *
         * @param {string} event
         * @param {Object} data
         */
        emit: function (event, data) {
            socket.emit(event, data);
        }
    };
})(io, optionsModule);
