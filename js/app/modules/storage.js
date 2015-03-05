/**
 * Storage Module
 */
var storageModule = (function (undefined, optionsModule) {
    'use strict';
    function ObjectStorage() {
        var self = this;
            self._name = '_objectStorage';
            self._init();
        return self;
    }

    ObjectStorage.prototype = {
        save: function (type) {
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
                    self.save('local');
                    callee();
                }, 60000);
            })();

        },
        timeoutId: 0,
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
                if (storage.local.user === undefined) {
                    storage.local.user = {};
                }
            },
            /**
             *
             * @param {String} identity
             */
            persistIdentity: function(identity){
              this.getLocal().user.identity = identity;
            },
            /**
             *
             * @returns {String}
             */
            gtIdentity: function(){
                var identity = this.getLocal().user.identity;
                if(identity === undefined){
                    return '';
                }
                return identity;
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
                if(_private.getSettings()[key] === undefined){
                    _private.getSettings()[key] = {};
                }
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
        /**
         *
         * @param {string} key
         * @param {object} obj
         */
        persistColumnsSettings: function (key, obj) {
            _private.persistColumnsSettings(key, obj);
        },
        /**
         *
         * @param {string} key
         * @param {string} attr
         * @param {string} val
         */
        persistSetting: function (key, attr, val) {
            _private.persistSetting(key, attr, val);
        },
        /**
         *
         * @returns {Object}
         */
        getSettings: function () {
            return _private.getColumnsSettings();
        },
        /**
         *
         * @param {string} key
         * @param {string} attr
         * @returns {boolean}
         */
        hasSetting: function (key, attr) {
            return !!_private.getSettingByKey(key, attr);
        },
        /**
         *
         * @param {string} key
         * @param {string} attr
         * @returns {String|undefined}
         */
        getSettingByKey: function (key, attr) {
            return _private.getSettingByKey(key, attr);
        },
        /**
         *
         * @param {string} key
         * @returns {boolean}
         */
        hasSession: function (key) {
            var storage = _private.getSession()[key];
            return !!(storage !== undefined && !$.isEmptyObject(storage));
        },
        /**
         *
         * @param {string} key
         * @param {object} obj
         */
        addToSession: function (key, obj) {
            _private.addToSession(key, obj);
        },
        /**
         *
         * @param {string} key
         */
        removeFromSession: function (key) {
            delete this.getSession()[key];
        },
        /**
         *
         * @param {string} [id]
         * @returns {Object}
         */
        getSession: function (id) {
            if (id === undefined) {
                return _private.getSession();
            } else {
                return _private.getSession()[id];
            }
        },
        /**
         *
         * @returns {ObjectStorage}
         */
        getStorage: function () {
            return storage;
        },
        /**
         *
         * @returns {String}
         */
        getUserName: function () {
            return _private.getUserName();
        },
        /**
         *
         * @returns {String}
         */
        getUserID: function () {
            return _private.getUserID();
        },
        /**
         *
         * @returns {String}
         */
        getEmployeeID: function () {
            return _private.getEmployeeID();
        },
        /**
         *
         * @returns {Array}
         */
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
         * @param {string} id
         * @param {string} employeeId
         * @param {string} name
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
        /**
         * @param {String} key
         * @returns {String|undefined}
         */
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
        },
        /**
         *
         * @param {String} identity
         */
        persistIdentity: function(identity){
            _private.persistIdentity(identity);
        },
        /**
         * @returns {string}
         */
        getIdentity: function(){
            return _private.getIdentity();
        }
    };
})(undefined, optionsModule);