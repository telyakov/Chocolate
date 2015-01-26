var AgileFilter = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend(
        /** @lends AgileFilter */
        {
            defaults: {
                $obj: null
            },
            /**
             * @method destroy
             */
            destroy: function () {
                this.set('$obj', null);
            },
            /**
             * @private
             * @returns {jQuery}
             */
            _getJqueryObj: function () {
                return this.get('$obj');
            },
            /**
             * @returns {String}
             */
            getCaption: function () {
                return this._getJqueryObj().children('caption').text();
            },
            /**
             * @returns {String}
             */
            getName: function () {
                var key = this._getJqueryObj().children('key').text();
                if (key) {
                    return key.toLowerCase();
                }
                return this._getJqueryObj().children('name').text().toLowerCase();
            },
            /**
             * @returns {String}
             */
            getReadProc: function () {
                return this._getJqueryObj().children('readProc').text();
            },
            /**
             * @returns {String}
             */
            getFilterType: function () {
                return this._getJqueryObj().children('filterType').text();
            },
            /**
             * @returns {String}
             */
            getMultiSelect: function () {
                return this._getJqueryObj().children('multiSelect').text();
            },
            /**
             * @returns {String}
             */
            getStandartType: function () {
                return this._getJqueryObj().children('standartType').text();
            },
            /**
             * @returns {String}
             */
            getTooltipText: function () {
                return this._getJqueryObj().children('tooltipText').text();
            },
            /**
             * @returns {String}
             */
            getToNextRow: function () {
                return this._getJqueryObj().children('toNextRow').text();
            },
            /**
             * @returns {String}
             */
            getVisible: function () {
                return this._getJqueryObj().children('visible').text();
            },
            /**
             * @returns {String}
             */
            getEnabled: function () {
                return this._getJqueryObj().children('enabled').text();
            },
            /**
             * @returns {String}
             */
            getDialogType: function () {
                return this._getJqueryObj().children('dialogType').text();
            },
            /**
             * @returns {String}
             */
            getDialogCaption: function () {
                return this._getJqueryObj().children('dialogCaption').text();
            },
            /**
             * @returns {String}
             */
            getProperties: function () {
                return this._getJqueryObj().children('properties').text();
            },
            /**
             * @returns {String}
             */
            getEventChange: function () {
                return this._getJqueryObj().children('event_change').text();
            },
            /**
             * @returns {String}
             */
            getWidth: function () {
                return this._getJqueryObj().children('width').text();
            },
            /**
             * @returns {String}
             */
            getValueFormat: function () {
                return this._getJqueryObj().children('valueFormat').text();
            },
            /**
             * @returns {String}
             */
            getDefaultValue: function () {
                return this._getJqueryObj().children('defaultValue').text();
            }
        });
})(Backbone);
