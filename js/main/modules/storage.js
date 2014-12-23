/**
 * Storage Module
 */
var storageModule = (function (undefined) {
    'use strict';
    function ObjectStorage(duration) {
        var self,
            name = '_objectStorage',
            defaultDuration = 15000;
        if (ObjectStorage.instances[name]) {
            self = ObjectStorage.instances[name];
            self.duration = duration || self.duration;
        } else {
            self = this;
            self._name = name;
            self.duration = duration || defaultDuration;
            self._init();
            ObjectStorage.instances[name] = self;
        }
        return self;
    }

    ObjectStorage.instances = {};
    ObjectStorage.prototype = {
        // type == local || session
        _save: function (type) {
            var stringified = JSON.stringify(this[type]),
                storage = window[type + 'Storage'];
            if (storage.getItem(this._name) !== stringified) {
                storage.setItem(this._name, stringified);
            }
        },
        _get: function (type) {
            this[type] = JSON.parse(window[type + 'Storage'].getItem(this._name)) || {};
        },
        _init: function () {
            var self = this;
            self._get('local');
            self._get('session');
            (function callee() {
                self.timeoutId = setTimeout(function () {
                    self._save('local');
                    callee();
                }, self._duration);
            })();
            if (window.addEventListener) {
                window.addEventListener('beforeunload', function () {
                    self._save('local');
                    self._save('session');
                });
            }
            else {
                window.attachEvent('beforeunload', function () {
                    self._save('local');
                    self._save('session');
                });
            }

        },
        timeoutId: null,
        local: {},
        session: {}
    };
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
            getEmployeeID: function () {
                return _private.getUser().employeeId;
            },
            getUserRoles: function () {
                return _private.getUser().roles;
            },
            getColumnsSettings: function () {
                return _private.getLocal().settings;
            },
            saveUser: function (id, employeeId, name) {
                _private.getSession().user = {
                    id: id,
                    employeeId: employeeId,
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
            },
            addToSession: function (key, obj) {
                this.getSession()[key] = obj;
            },
            persistColumnsSettings: function (key, obj) {
                this.getColumnsSettings()[key] = obj;
            },
            getSettings: function(){
                return _private.getLocal().grid_settings;
            },
            getSettingByKey: function(key, attr){
                return _private.getSettings()[key][attr];
            },
            persistSetting: function(key, attr, val){
               _private.getSettings()[key][attr] = val;
            }
        };
    _private.init();
    return {
        persistColumnsSettings: function(key, obj){
            _private.persistColumnsSettings(key, obj);
        },
        persistSetting: function(key, attr, val){
            _private.persistSetting(key, attr, val);
        },
        getSettings: function () {
            return _private.getColumnsSettings();
        },
        hasSetting: function(key, attr){
            return !!_private.getSettingByKey(key, attr);
        },
        getSettingByKey: function(key, attr){
            return _private.getSettingByKey(key, attr);
        },
        hasSession: function (key) {
            var storage = _private.getSession()[key];
            return !!(storage !== undefined && !$.isEmptyObject(storage));
        },
        addToSession: function (key, obj) {
            _private.addToSession(key, obj);
        },
        getSession: function (id) {
            if (id === undefined) {
                return _private.getSession();
            } else {
                return _private.getSession()[id];
            }
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
        getEmployeeID: function () {
            return _private.getEmployeeID();
        },
        getUserRoles: function () {
            return _private.getUserRoles();
        },
        /**
         * @param id {string}
         * @param employeeId {string}
         * @param name {string}
         * @returns {boolean}
         */
        saveUser: function (id, employeeId, name) {
            return _private.saveUser(id, employeeId, name);
        },
        saveRoles: function (roles) {
            return _private.saveRoles(roles);
        }
    };
})(undefined);