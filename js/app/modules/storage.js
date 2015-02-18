/**
 * Storage Module
 */
var storageModule = (function (undefined, optionsModule) {
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
                if (storage.local.settings === undefined) {
                    storage.local.settings = {};
                }
                if (storage.local.grid_settings === undefined) {
                    storage.local.grid_settings = {};
                }
                if (storage.local.appSettings === undefined) {
                    storage.local.appSettings = {};
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
            },
            saveForms: function (forms) {
                var result = {},
                    i,
                    hasOwn = Object.prototype.hasOwnProperty;
                for (i in forms) {
                    if (hasOwn.call(forms, i)) {
                        /**
                         * @type FormDTO
                         */
                        var form = forms[i];
                        if (form.viewname) {
                            var isWrite = 0;
                            if (form.write === '1') {
                                isWrite = 1;
                            }
                            var correctView = helpersModule.getCorrectXmlName(form.viewname);
                            result[correctView] = {
                                viewname: correctView,
                                write: isWrite
                            }
                        }
                    }
                }
                if (_private.getUser() === undefined) {
                    _private.getSession().user = {};
                }
                _private.getUser().forms = result;
                return true;
            },
            addToSession: function (key, obj) {
                this.getSession()[key] = obj;
            },
            persistColumnsSettings: function (key, obj) {
                this.getColumnsSettings()[key] = obj;
            },
            getSettings: function () {
                return _private.getLocal().grid_settings;
            },
            getSettingByKey: function (key, attr) {
                var data = _private.getSettings()[key];
                if (data === undefined) {
                    return undefined;
                }
                return data[attr];
            },
            persistSetting: function (key, attr, val) {
                _private.getSettings()[key][attr] = val;
            },
            getApplicationSettings: function () {
                return _private.getLocal().appSettings;
            },
            /**
             *
             * @param {String} key
             * @returns {String|undefined}
             */
            getApplicationSettingByKey: function (key) {
                return _private.getApplicationSettings()[key];
            },
            /**
             *
             * @param {String} key
             * @param {String} value
             */
            persistApplicationSetting: function (key, value) {
                _private.getApplicationSettings()[key] = value;
            }
        };
    _private.init();
    return {
        persistColumnsSettings: function (key, obj) {
            _private.persistColumnsSettings(key, obj);
        },
        persistSetting: function (key, attr, val) {
            _private.persistSetting(key, attr, val);
        },
        getSettings: function () {
            return _private.getColumnsSettings();
        },
        hasSetting: function (key, attr) {
            return !!_private.getSettingByKey(key, attr);
        },
        getSettingByKey: function (key, attr) {
            return _private.getSettingByKey(key, attr);
        },
        hasSession: function (key) {
            var storage = _private.getSession()[key];
            return !!(storage !== undefined && !$.isEmptyObject(storage));
        },
        addToSession: function (key, obj) {
            _private.addToSession(key, obj);
        },
        removeFromSession: function (key) {
            delete this.getSession()[key];
        },
        /**
         *
         * @param {string} [id]
         * @returns {*}
         */
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
         *
         * @param {string} view
         * @returns {boolean}
         */
        hasAccessToWrite: function (view) {
            view = view.toLowerCase();
            var userSettings = optionsModule.getConstants('userSettingsXml'),
                taskForTop = optionsModule.getConstants('tasksForTopsXml'),
                task = optionsModule.getConstants('tasksXml');
            if ([taskForTop, task, userSettings].indexOf(view) !== -1) {
                return true;
            }
            var viewData = _private.getUser().forms[view];
            if (viewData) {
                return viewData.write === 1;
            }
            return false;
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
        /**
         * @param {Object} forms
         */
        saveForms: function (forms) {
            _private.saveForms(forms);
        },
        /**
         *
         * @param {Object} roles
         */
        saveRoles: function (roles) {
            _private.saveRoles(roles);
        },
        getApplicationSettingByKey: function (key) {
            return _private.getApplicationSettingByKey(key);
        },
        /**
         *
         * @param {String} key
         * @param {String} value
         */
        persistApplicationSetting: function (key, value) {
            _private.persistApplicationSetting(key, value);
        }
    };
})(undefined, optionsModule);