var DataFormProperties = (function (Backbone) {
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
        getKey: function(){
            return this.getJqueryObj().children('Key').text().toLowerCase();
        },
        getReadProc: function () {
            return this.getJqueryObj().children('readProc').text();
        },
        getDeleteProc: function () {
            return this.getJqueryObj().children('deleteProc').text();
        },
        getUpdateProc: function () {
            return this.getJqueryObj().children('updateProc').text();
        },
        getCreateProc: function () {
            return this.getJqueryObj().children('createProc').text();
        },
        getCreateEmptyProc: function () {
            return this.getJqueryObj().children('createEmptyProc').text();
        },
        getValidationProc: function () {
            return this.getJqueryObj().children('validationProc').text();
        },
        getAttachmentsSupport: function () {
            return this.getJqueryObj().children('attachmentsSupport').text();
        },
        getAttachmentsEntityType: function () {
            return this.getJqueryObj().children('attachmentsEntityType').text();
        },
        getHeaderText: function () {
            return this.getJqueryObj().children('headerText').text();
        },
        getStateProc: function () {
            return this.getJqueryObj().children('StateProc').text();
        },
        getHeaderImage: function () {
            return this.getJqueryObj().children('HeaderImage').text();
        },
        getWindowCaption: function () {
            return this.getJqueryObj().children('WindowCaption').text();
        },
        getAllowAddNew: function () {
            return this.getJqueryObj().children('allowAddNew').text();
        },
        getSaveButtonVisible: function () {
            return this.getJqueryObj().children('saveButtonVisible').text();
        },
        getAllowRemove: function () {
            return this.getJqueryObj().children('allowRemove').text();
        },
        getPrintActionsXml: function () {
            return this.getJqueryObj().children('printActionsXml').text();
        },
        getRefreshButtonVisible: function () {
            return this.getJqueryObj().children('refreshButtonVisible').text();
        },
        getAllowAuditButton: function () {
            return this.getJqueryObj().children('allowAuditButton').text();
        }
    });
})(Backbone);