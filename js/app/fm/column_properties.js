var ColumnProperties = (function (Backbone) {
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
        getHeaderImage: function(){
            return this.getJqueryObj().children('headerimage').text();
        },
        getCaption: function () {
            return this.getJqueryObj().children('caption').text();
        },
        getDataSource: function () {
            return this.getJqueryObj().children('dataSource').text();
        },
        getAllFields: function () {
            return this.getJqueryObj().children('allFields').text();
        },
        getFromDataSource: function () {
            return this.getJqueryObj().children('fromDataSource').text();
        },
        getAllowEdit: function () {
            return this.getJqueryObj().children('allowEdit').text();
        },
        getViewBind: function () {
            return this.getJqueryObj().children('viewBind').text();
        },
        getFromName: function () {
            return this.getJqueryObj().children('fromName').text();
        },
        getToName: function () {
            return this.getJqueryObj().children('toName').text();
        },
        getFromId: function () {
            return this.getJqueryObj().children('fromId').text();
        },
        getToId: function () {
            return this.getJqueryObj().children('toId').text().toLowerCase();
        },
        getKey: function () {
            return this.getJqueryObj().children('key').text().toLowerCase();
        },
        getVisible: function () {
            return this.getJqueryObj().children('visible').text();
        },
        getEditType: function () {
            var type = $.trim(this.getJqueryObj().children('editType').text());
            if(type){
                return type.toLowerCase();
            }else{
                return this.getCardEditType();
            }
        },
        getCardEditType: function () {
            return  $.trim(this.getJqueryObj().children('cardEditType').text().toLowerCase());
        },
        getRequired: function () {
            return this.getJqueryObj().children('required').text();
        },
        getDefault: function () {
            return this.getJqueryObj().children('default').text();
        },
        getShowInRowDisplay: function () {
            return this.getJqueryObj().children('showInRowDisplay').text();
        },
        getTabId: function () {
            return this.getJqueryObj().children('tabId').text();
        },
        getFormat: function () {
            return this.getJqueryObj().children('format').text();
        },
        getSingleValueMode: function () {
            return this.getJqueryObj().children('singleValueMode').text();
        },
        getCardKey: function () {
            return this.getJqueryObj().children('cardKey').text();
        },
        getCardVisible: function () {
            return this.getJqueryObj().children('cardVisible').text();
        },
        getCardX: function () {
            return this.getJqueryObj().children('cardX').text();
        },
        getProperties: function () {
            return this.getJqueryObj().children('properties').text();
        },
        getEditBehavior: function () {
            return this.getJqueryObj().children('editBehavior').text();
        },
        getViewName: function () {
            return this.getJqueryObj().children('viewName').text();
        },
        getCardMultiLine: function () {
            return this.getJqueryObj().children('cardMultiLine').text();
        },
        getCardHeight: function () {
            return this.getJqueryObj().children('cardHeight').text();
        },
        getCardWidth: function () {
            return this.getJqueryObj().children('cardWidth').text();
        },
        getCardY: function () {
            return this.getJqueryObj().children('cardY').text();
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