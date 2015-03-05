/**
 * Socket module. Based on socket.io library
 * https://github.com/Automattic/socket.io-client
 */
var socketModule = (function (io, optionsModule) {
    'use strict';




    var connectUrl = optionsModule.getUrl('webSocketServer'),
        socket = io.connect(connectUrl, {reconnectionDelay: 3000, query: 'name=something'}),
        _private = {
            connectErrorHandler: function () {
                mediator.publish(
                    optionsModule.getChannel('showError'),
                    optionsModule.getMessage('noConnectWebsocket')
                );
                socket.emit('authorization', {

                });
                socket.io
                    .off('connect_error')
                    .off('connect')
                    .on('connect', _private.connectHandler);
            },
            connectHandler: function () {
                var token = socket.io.engine.id,
                    //login = storageModule.getUserID(),
                    login = '1180',
                    password = 'четверг';

                    var identity = [login, password]. join('&'),
                        shaIdentityObj = new jsSHA(identity, "TEXT"),
                        hexIdentity = shaIdentityObj.getHash("SHA-256", "HEX");


                var fullIdentity =  [hexIdentity, token].join('&');
                var shaFullIdentityObj = new jsSHA(fullIdentity, "TEXT"),
                    hashIdentity = shaFullIdentityObj.getHash("SHA-256", "HEX");

                socket.emit('login', {
                    login: login,
                    identity: hashIdentity
                });

                socket.on('loginResponse', function(success){
                    console.log(success);
                    if(success){
                        storageModule.persistIdentity(hexIdentity);
                    }else{
                        storageModule.persistIdentity('');
                    }
                });

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
