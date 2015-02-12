/**
 * @class AppModel
 */
var AppModel = (function (undefined, Backbone, storageModule, optionsModule) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            userName: null,
            userId: null,
            employeeId: null
        },
        /**
         *
         * @param {String} view
         */
        setAutoStartForm: function (view) {
            storageModule.persistApplicationSetting('startForm', view)
        },
        /**
         * @returns {string}
         */
        getAutoStartForm: function () {
            var startForm = storageModule.getApplicationSettingByKey('startForm');
            if (startForm === undefined) {
                var currentUser = parseInt(this.get('userId'), 10),
                    topsIdList = optionsModule.getConstants('topsIdList');

                if (topsIdList.indexOf(currentUser) === -1) {
                    return optionsModule.getConstants('tasksXml');
                } else {
                    return optionsModule.getConstants('tasksForTopsXml');
                }


            }
            return startForm;
        }
    });
})(undefined, Backbone, storageModule, optionsModule);
