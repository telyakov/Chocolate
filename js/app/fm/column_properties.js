var ColumnProperties = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            $obj: null
        },
        getCaption: function () {
            return this.get('$obj').children('caption').text();
        },
        getDataSource: function () {
            return this.get('$obj').children('dataSource').text();
        },
        getAllFields: function () {
            return this.get('$obj').children('allFields').text();
        },
        getFromDataSource: function () {
            return this.get('$obj').children('fromDataSource').text();
        },
        getAllowEdit: function () {
            return this.get('$obj').children('allowEdit').text();
        },
        getToName: function () {
            return this.get('$obj').children('toName').text();
        },
        getViewBind: function () {
            return this.get('$obj').children('viewBind').text();
        },
        getFromName: function () {
            return this.get('$obj').children('fromName').text();
        },
        getFromId: function () {
            return this.get('$obj').children('fromId').text();
        },
        getKey: function () {
            return this.get('$obj').children('key').text().toLowerCase();
        },
        getVisible: function () {
            return this.get('$obj').children('visible').text();
        },
        getEditType: function () {
            return this.get('$obj').children('editType').text();
        },
        getToId: function () {
            return this.get('$obj').children('toId').text();
        },
        getRequired: function () {
            return this.get('$obj').children('required').text();
        },
        getDefault: function () {
            return this.get('$obj').children('default').text();
        },
        getShowInRowDisplay: function () {
            return this.get('$obj').children('showInRowDisplay').text();
        },
        getTabId: function () {
            return this.get('$obj').children('tabId').text();
        },
        getFormat: function () {
            return this.get('$obj').children('format').text();
        },
        getSingleValueMode: function () {
            return this.get('$obj').children('singleValueMode').text();
        },
        getCardKey: function () {
            return this.get('$obj').children('cardKey').text();
        },
        getCardEditType: function () {
            return this.get('$obj').children('cardEditType').text();
        },
        getCardVisible: function () {
            return this.get('$obj').children('cardVisible').text();
        },
        getCardX: function () {
            return this.get('$obj').children('cardX').text();
        },
        getProperties: function () {
            return this.get('$obj').children('properties').text();
        },
        getEditBehavior: function () {
            return this.get('$obj').children('editBehavior').text();
        },
        getViewName: function () {
            return this.get('$obj').children('viewName').text();
        },
        getCardMultiLine: function () {
            return this.get('$obj').children('cardMultiLine').text();
        },
        getCardHeight: function () {
            return this.get('$obj').children('cardHeight').text();
        },
        getCardWidth: function () {
            return this.get('$obj').children('cardWidth').text();
        },
        getCardY: function () {
            return this.get('$obj').children('cardY').text();
        },
        getVisibleKey: function(){
            var toID = this.getToId();
            if(toID){
                return toID;
            }else{
                return this.getKey();
            }
        }
    });
})(Backbone);