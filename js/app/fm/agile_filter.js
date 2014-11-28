var AgileFilter = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            $obj: null
        },
        getCaption: function () {
            return this.get('$obj').children('caption').text();
        },
        getName: function () {
            var key = this.get('$obj').children('key').text();
            if (key) {
                return key.toLowerCase();
            }
            return this.get('$obj').children('name').text().toLowerCase();
        },
        getReadProc: function () {
            return this.get('$obj').children('readProc').text();
        },
        getFilterType: function () {
            return this.get('$obj').children('filterType').text();
        },
        getMultiSelect: function () {
            return this.get('$obj').children('multiSelect').text();
        },
        getStandartType: function () {
            return this.get('$obj').children('standartType').text();
        },
        getTooltipText: function () {
            return this.get('$obj').children('tooltipText').text();
        },
        getToNextRow: function () {
            return this.get('$obj').children('toNextRow').text();
        },
        getVisible: function () {
            return this.get('$obj').children('visible').text();
        },
        getEnabled: function () {
            return this.get('$obj').children('enabled').text();
        },
        getDialogType: function () {
            return this.get('$obj').children('dialogType').text();
        },
        getDialogCaption: function () {
            return this.get('$obj').children('dialogCaption').text();
        },
        getProperties: function () {
            return this.get('$obj').children('properties').text();
        },
        getEvent_change: function () {
            return this.get('$obj').children('event_change').text();
        },
        getWidth: function () {
            return this.get('$obj').children('width').text();
        },
        getValueFormat: function () {
            return this.get('$obj').children('valueFormat').text();
        },
        getDefaultValue: function () {
            return this.get('$obj').children('defaultValue').text();
        }

    });
})(Backbone);