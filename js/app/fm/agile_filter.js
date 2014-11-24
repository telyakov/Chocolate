var AgileFilter = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            $obj: null
        },
        getCaption: function () {
            this.$obj.children('caption').html();
        },
        getName: function () {
            var key = this.$obj.children('key').html();
            if (key) {
                return key;
            }
            return this.$obj.children('name').html();
        },
        getReadProc: function () {
            return this.$obj.children('readProc').html();
        },
        getFilterType: function () {
            this.$obj.children('filterType').html();
        },
        getMultiSelect: function () {
            this.$obj.children('multiSelect').html();
        },
        getStandartType: function () {
            return this.$obj.children('standartType').html();
        },
        getTooltipText: function () {
            this.$obj.children('tooltipText').html();
        },
        getToNextRow: function () {
            this.$obj.children('toNextRow').html();
        },
        getVisible: function () {
            this.$obj.children('visible').html();
        },
        getEnabled: function () {
            return this.$obj.children('enabled').html();
        },
        getDialogType: function () {
            this.$obj.children('dialogType').html();
        },
        getDialogCaption: function () {
            this.$obj.children('dialogCaption').html();
        },
        getProperties: function () {
            this.$obj.children('properties').html();
        },
        getEvent_change: function () {
            return this.$obj.children('event_change').html();
        },
        getWidth: function () {
            this.$obj.children('width').html();
        },
        getValueFormat: function () {
            this.$obj.children('valueFormat').html();
        },
        getDefaultValue: function () {
            this.$obj.children('defaultValue').html();
        }

    });
})(Backbone);