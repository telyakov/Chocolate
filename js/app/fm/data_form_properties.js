var DataFormProperties = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            $obj: null
        },
        getReadProc: function () {
            this.get('$obj').children('readProc').html();
        },
        getDeleteProc: function () {
            this.get('$obj').children('deleteProc').html();
        },
        getUpdateProc: function () {
            this.get('$obj').children('updateProc').html();
        },
        getCreateProc: function () {
            this.get('$obj').children('createProc').html();
        },
        getCreateEmptyProc: function () {
            this.get('$obj').children('createEmptyProc').html();
        },
        getValidationProc: function () {
            this.get('$obj').children('validationProc').html();
        },
        getAttachmentsSupport: function () {
            this.get('$obj').children('attachmentsSupport').html();
        },
        getAttachmentsEntityType: function () {
            this.get('$obj').children('attachmentsEntityType').html();
        },
        getHeaderText: function () {
            this.get('$obj').children('headerText').html();
        },
        getStateProc: function () {
            this.get('$obj').children('stateProc').html();
        },
        getHeaderImage: function () {
            this.get('$obj').children('headerImage').html();
        },
        getWindowCaption: function () {
            return this.get('$obj').children('WindowCaption').text();
        },
        getAllowAddNew: function () {
            this.get('$obj').children('allowAddNew').html();
        },
        getSaveButtonVisible: function () {
            this.get('$obj').children('saveButtonVisible').html();
        },
        getAllowRemove: function () {
            this.get('$obj').children('allowRemove').html();
        },
        getPrintActionsXml: function () {
            this.get('$obj').children('printActionsXml').html();
        },
        getRefreshButtonVisible: function () {
            this.get('$obj').children('refreshButtonVisible').html();
        },
        getAllowAuditButton: function () {
            this.get('$obj').children('allowAuditButton').html();
        }
    });
})(Backbone);