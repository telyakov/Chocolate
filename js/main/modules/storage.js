/**
 * Storage Module
 */
var storageModule = (function (ObjectStorage) {
    'use strict';
    var storage = new ObjectStorage(),
        _private = {
            init: function () {
                storage.session = {};
                if (typeof storage.local.settings === 'undefined') {
                    storage.local.settings = {};
                }
                if (typeof storage.local.grid_settings === 'undefined') {
                    storage.local.grid_settings = {};
                }
            },
            getSession: function () {
                return storage.session;
            },
            getLocal: function () {
                return storage.local;
            },
            getUser: function () {
                return _private.getSession().user;
            },
            getUserName: function () {
                return _private.getUser().name;
            },
            getUserID: function () {
                return _private.getUser().id;
            },
            getUserRoles: function () {
                return _private.getUser().roles;
            },
            saveUser: function (id, name) {
                _private.getSession().user = {
                    id: id,
                    name: name
                };
                return true;
            },
            saveRoles: function (roles) {
                var result = [],
                    i,
                    hasOwn = Object.prototype.hasOwnProperty,
                    role;
                for (i in roles) {
                    if (hasOwn.call(roles, i)) {
                        role = roles[i].name.toLowerCase();
                        result.push(role);
                    }
                }
                if (typeof _private.getUser() === 'undefined') {
                    _private.getSession().user = {};
                }
                _private.getUser().roles = result;
                return true;
            }
        };
    _private.init();
    return {
        getSession: function () {
            return _private.getSession();
        },
        getLocal: function () {
            return _private.getLocal();
        },
        getStorage: function () {
            return storage;
        },
        getUserName: function () {
            return _private.getUserName();
        },
        getUserID: function () {
            return _private.getUserID();
        },
        getUserRoles: function () {
            return _private.getUserRoles();
        },
        /**
         * @param id {string}
         * @param name {string}
         * @returns {boolean}
         */
        saveUser: function (id, name) {
            return _private.saveUser(id, name);
        },
        saveRoles: function (roles) {
            return _private.saveRoles(roles);
        }
    };
})(ObjectStorage);