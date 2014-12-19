/**
 * User module. Dependencies moment.js, optionsModule, storageModule, mediator
 */
var userModule = (function (moment, optionsModule, storageModule) {
    'use strict';
    var _private = {
        getName: function () {
            return storageModule.getUserName();
        },
        getSign: function () {
            return [
                '',
                _private.getName(),
                moment(new Date()).format(optionsModule.getSetting('signatureFormat')),
                ''
            ].join(' ');
        },
        getID: function () {
            return storageModule.getUserID();
        },
        getEmployeeID: function(){
            return storageModule.getEmployeeID();
        },
        hasRole: function (role) {
            var prepareRole = role.toLowerCase(),
                roles = storageModule.getUserRoles();
            if (Array.isArray(roles)) {
                return storageModule.getUserRoles().indexOf(prepareRole) !== -1;
            } else {
                return false;
            }
        }
    };
    return {
        getSign: function () {
            return _private.getSign();
        },
        getID: function () {
            return _private.getID();
        },
        getName: function () {
            return _private.getName();
        },
        hasRole: function (role) {
            return _private.hasRole(role);
        },
        getEmployeeID: function(){
            return _private.getEmployeeID();
        }
    };

})(moment, optionsModule, storageModule);