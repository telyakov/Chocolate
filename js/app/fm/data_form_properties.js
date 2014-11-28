var DataFormProperties = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            $obj: null
        },
        getKey: function(){
            return this.get('$obj').children('Key').text();
        },
        getReadProc: function () {
            return this.get('$obj').children('readProc').text();
        },
        getDeleteProc: function () {
            return this.get('$obj').children('deleteProc').text();
        },
        getUpdateProc: function () {
            return this.get('$obj').children('updateProc').text();
        },
        getCreateProc: function () {
            return this.get('$obj').children('createProc').text();
        },
        getCreateEmptyProc: function () {
            return this.get('$obj').children('createEmptyProc').text();
        },
        getValidationProc: function () {
            return this.get('$obj').children('validationProc').text();
        },
        getAttachmentsSupport: function () {
            return this.get('$obj').children('attachmentsSupport').text();
        },
        getAttachmentsEntityType: function () {
            return this.get('$obj').children('attachmentsEntityType').text();
        },
        getHeaderText: function () {
            return this.get('$obj').children('headerText').text();
        },
        getStateProc: function () {
            return this.get('$obj').children('StateProc').text();
        },
        getHeaderImage: function () {
            return this.get('$obj').children('HeaderImage').text();
        },
        getWindowCaption: function () {
            return this.get('$obj').children('WindowCaption').text();
        },
        getAllowAddNew: function () {
            return this.get('$obj').children('allowAddNew').text();
        },
        getSaveButtonVisible: function () {
            return this.get('$obj').children('saveButtonVisible').text();
        },
        getAllowRemove: function () {
            return this.get('$obj').children('allowRemove').text();
        },
        getPrintActionsXml: function () {
            return this.get('$obj').children('printActionsXml').text();
        },
        getRefreshButtonVisible: function () {
            return this.get('$obj').children('refreshButtonVisible').text();
        },
        getAllowAuditButton: function () {
            return this.get('$obj').children('allowAuditButton').text();
        }
    });
})(Backbone);