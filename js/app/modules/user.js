/**
 * User module. Dependencies moment.js, optionsModule, storageModule, mediator
 */
var userModule = (function (moment, optionsModule, storageModule) {
    'use strict';
    var _private = {
        /**
         *
         * @returns {String}
         */
        getName: function () {
            return storageModule.getUserName();
        },
        /**
         *
         * @returns {String}
         */
        getSign: function () {
            return [
                '',
                _private.getName(),
                moment().format(optionsModule.getSetting('signatureFormat')),
                ''
            ].join(' ');
        },
        /**
         *
         * @returns {String}
         */
        getID: function () {
            return storageModule.getUserID();
        },
        /**
         *
         * @returns {String}
         */
        getEmployeeID: function () {
            return storageModule.getEmployeeID();
        },
        /**
         *
         * @param {String} role
         * @returns {Boolean}
         */
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
        /**
         *
         * @returns {String}
         */
        getSign: function () {
            return _private.getSign();
        },
        /**
         *
         * @returns {String}
         */
        getID: function () {
            return _private.getID();
        },
        /**
         *
         * @returns {String}
         */
        getName: function () {
            return _private.getName();
        },
        /**
         *
         * @param {String} role
         * @returns {Boolean}
         */
        hasRole: function (role) {
            return _private.hasRole(role);
        },
        /**
         *
         * @returns {String}
         */
        getEmployeeID: function () {
            return _private.getEmployeeID();
        }
    };

})(moment, optionsModule, storageModule);