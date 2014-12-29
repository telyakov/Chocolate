var AgileFilter = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            $obj: null
        },
        /**
         * @returns {jQuery}
         */
        getJqueryObj: function(){
            return this.get('$obj');
        },
        getCaption: function () {
            return this.getJqueryObj().children('caption').text();
        },
        getName: function () {
            var key = this.getJqueryObj().children('key').text();
            if (key) {
                return key.toLowerCase();
            }
            return this.getJqueryObj().children('name').text().toLowerCase();
        },
        getReadProc: function () {
            return this.getJqueryObj().children('readProc').text();
        },
        getFilterType: function () {
            return this.getJqueryObj().children('filterType').text();
        },
        getMultiSelect: function () {
            return this.getJqueryObj().children('multiSelect').text();
        },
        getStandartType: function () {
            return this.getJqueryObj().children('standartType').text();
        },
        getTooltipText: function () {
            return this.getJqueryObj().children('tooltipText').text();
        },
        getToNextRow: function () {
            return this.getJqueryObj().children('toNextRow').text();
        },
        getVisible: function () {
            return this.getJqueryObj().children('visible').text();
        },
        getEnabled: function () {
            return this.getJqueryObj().children('enabled').text();
        },
        getDialogType: function () {
            return this.getJqueryObj().children('dialogType').text();
        },
        getDialogCaption: function () {
            return this.getJqueryObj().children('dialogCaption').text();
        },
        getProperties: function () {
            return this.getJqueryObj().children('properties').text();
        },
        getEvent_change: function () {
            return this.getJqueryObj().children('event_change').text();
        },
        getWidth: function () {
            return this.getJqueryObj().children('width').text();
        },
        getValueFormat: function () {
            return this.getJqueryObj().children('valueFormat').text();
        },
        getDefaultValue: function () {
            return this.getJqueryObj().children('defaultValue').text();
        }
    });
})(Backbone);