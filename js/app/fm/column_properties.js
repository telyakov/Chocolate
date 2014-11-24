var ColumnProperties = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            $obj: null
        },
        getCaption: function () {
            this.$obj.children('caption').html();
        },
        getDataSource: function () {
            return this.$obj.children('dataSource').html();
        },
        getAllFields: function () {
            this.$obj.children('allFields').html();
        },
        getFromDataSource: function () {
            this.$obj.children('fromDataSource').html();
        },
        getAllowEdit: function () {
            return this.$obj.children('allowEdit').html();
        },
        getToName: function () {
            this.$obj.children('toName').html();
        },
        getViewBind: function () {
            this.$obj.children('viewBind').html();
        },
        getFromName: function () {
            this.$obj.children('fromName').html();
        },
        getFromId: function () {
            return this.$obj.children('fromId').html();
        },
        getKey: function () {
            this.$obj.children('key').html();
        },
        getVisible: function () {
            this.$obj.children('visible').html();
        },
        getEditType: function () {
            this.$obj.children('editType').html();
        },
        getToId: function () {
            return this.$obj.children('toId').html();
        },
        getRequired: function () {
            this.$obj.children('required').html();
        },
        getDefault: function () {
            this.$obj.children('default').html();
        },
        getShowInRowDisplay: function () {
            this.$obj.children('showInRowDisplay').html();
        },
        getTabId: function () {
            this.$obj.children('tabId').html();
        },
        getFormat: function () {
            this.$obj.children('format').html();
        },
        getSingleValueMode: function () {
            this.$obj.children('singleValueMode').html();
        },
        getCardKey: function () {
            return this.$obj.children('cardKey').html();
        },
        getCardEditType: function () {
            this.$obj.children('cardEditType').html();
        },
        getCardVisible: function () {
            this.$obj.children('cardVisible').html();
        },
        getCardX: function () {
            this.$obj.children('cardX').html();
        },
        getProperties: function () {
            this.$obj.children('properties').html();
        },
        getEditBehavior: function () {
            this.$obj.children('editBehavior').html();
        },
        getViewName: function () {
            this.$obj.children('viewName').html();
        },
        getCardMultiLine: function () {
            return this.$obj.children('cardMultiLine').html();
        },
        getCardHeight: function () {
            this.$obj.children('cardHeight').html();
        },
        getCardWidth: function () {
            this.$obj.children('cardWidth').html();
        },
        getCardY: function () {
            this.$obj.children('cardY').html();
        }
    });
})(Backbone);