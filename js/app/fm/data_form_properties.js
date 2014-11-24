var DataFormProperties = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            $obj: null
        },
        getReadProc: function () {
            this.$obj.children('readProc').html();
        },
        getDeleteProc: function () {
            this.$obj.children('deleteProc').html();
        },
        getUpdateProc: function () {
            this.$obj.children('updateProc').html();
        },
        getCreateProc: function () {
            this.$obj.children('createProc').html();
        },
        getCreateEmptyProc: function () {
            this.$obj.children('createEmptyProc').html();
        },
        getValidationProc: function () {
            this.$obj.children('validationProc').html();
        },
        getAttachmentsSupport: function () {
            this.$obj.children('attachmentsSupport').html();
        },
        getAttachmentsEntityType: function () {
            this.$obj.children('attachmentsEntityType').html();
        },
        getHeaderText: function () {
            this.$obj.children('headerText').html();
        },
        getStateProc: function () {
            this.$obj.children('stateProc').html();
        },
        getHeaderImage: function () {
            this.$obj.children('headerImage').html();
        },
        getWindowCaption: function () {
            this.$obj.children('windowCaption').html();
        },
        getAllowAddNew: function () {
            this.$obj.children('allowAddNew').html();
        },
        getSaveButtonVisible: function () {
            this.$obj.children('saveButtonVisible').html();
        },
        getAllowRemove: function () {
            this.$obj.children('allowRemove').html();
        },
        getPrintActionsXml: function () {
            this.$obj.children('printActionsXml').html();
        },
        getRefreshButtonVisible: function () {
            this.$obj.children('refreshButtonVisible').html();
        },
        getAllowAuditButton: function () {
            this.$obj.children('allowAuditButton').html();
        }
    });
})(Backbone);