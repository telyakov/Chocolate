/**
 * Socket module. Based on socket.io library
 * https://github.com/Automattic/socket.io-client
 */
var socketModule = (function (io, optionsModule) {
    'use strict';
    var restoreConnection = false,
        isAlreadyShowedError = false;
    var connectUrl = optionsModule.getUrl('webSocketServer'),
        socket,
        _private = {
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


    return {
        getToken: function(){
            //todo: throw exception if called before connect
            return socket.io.engine.id;

        },
        /**
         *
         * @param {String} login
         * @param {String} identity
         * @returns {Deferred}
         */
        login: function(login, identity){
            storageModule.persistIdentity(identity);
            var asyncTask = deferredModule.create();
            socketModule.emit('login', {
                login: login,
                identity: identity,
                id: deferredModule.save(asyncTask)
            });
            return asyncTask;
        },
        /**
         *
         * @param {Deferred} asyncTask
         */
        connect: function (asyncTask) {
            socket = io.connect(connectUrl, {reconnectionDelay: 3000, timeout: 15000});
            socket.io.on('connect_error', function () {
                if (!isAlreadyShowedError) {
                    mediator.publish(
                        optionsModule.getChannel('showError'),
                        optionsModule.getMessage('noConnectWebsocket')
                    );
                    isAlreadyShowedError = true;
                }
            });
            socket.on('loginResponse', function(success){
                console.log(success);
                if(success){
                    storageModule.persistIdentity(hexIdentity);
                }else{
                    storageModule.persistIdentity('');
                }
            });
            socket
                .on('connect', function () {
                    asyncTask.resolve({
                        restoreConnection: restoreConnection,
                        token: socket.io.engine.id
                    });
                    restoreConnection = true;
                    isAlreadyShowedError = false;
                })
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
        },
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
