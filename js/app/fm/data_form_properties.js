var DataFormProperties = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend(
        /** @lends DataFormProperties */
        {
            defaults: {
                $obj: null
            },
            /**
             * @method destroy
             */
            destroy: function () {
                this.set('$obj', null);
            },
            /**
             * @private
             * @returns {jQuery}
             */
            _getJqueryObj: function () {
                return this.get('$obj');
            },
            /**
             * @returns {String}
             */
            getKey: function () {
                return this._getJqueryObj().children('Key').text().toLowerCase();
            },
            /**
             * @returns {String}
             */
            getReadProc: function () {
                return this._getJqueryObj().children('readProc').text();
            },
            /**
             * @returns {String}
             */
            getDeleteProc: function () {
                return this._getJqueryObj().children('deleteProc').text();
            },
            /**
             * @returns {String}
             */
            getUpdateProc: function () {
                return this._getJqueryObj().children('updateProc').text();
            },
            /**
             * @returns {String}
             */
            getCreateProc: function () {
                return this._getJqueryObj().children('createProc').text();
            },
            /**
             * @returns {String}
             */
            getCreateEmptyProc: function () {
                return this._getJqueryObj().children('createEmptyProc').text();
            },
            /**
             * @returns {String}
             */
            getValidationProc: function () {
                return this._getJqueryObj().children('validationProc').text();
            },
            /**
             * @returns {String}
             */
            getAttachmentsSupport: function () {
                return this._getJqueryObj().children('attachmentsSupport').text();
            },
            /**
             * @returns {String}
             */
            getAttachmentsEntityType: function () {
                return this._getJqueryObj().children('attachmentsEntityType').text();
            },
            /**
             * @returns {String}
             */
            getHeaderText: function () {
                return this._getJqueryObj().children('headerText').text();
            },
            /**
             * @returns {String}
             */
            getStateProc: function () {
                return this._getJqueryObj().children('StateProc').text();
            },
            /**
             * @returns {String}
             */
            getHeaderImage: function () {
                return this._getJqueryObj().children('HeaderImage').text();
            },
            /**
             * @returns {String}
             */
            getWindowCaption: function () {
                return this._getJqueryObj().children('WindowCaption').text();
            },
            /**
             * @returns {String}
             */
            getAllowAddNew: function () {
                return this._getJqueryObj().children('allowAddNew').text();
            },
            /**
             * @returns {String}
             */
            getSaveButtonVisible: function () {
                return this._getJqueryObj().children('saveButtonVisible').text();
            },
            /**
             * @returns {String}
             */
            getAllowRemove: function () {
                return this._getJqueryObj().children('allowRemove').text();
            },
            /**
             * @returns {String}
             */
            getPrintActionsXml: function () {
                return this._getJqueryObj().children('printActionsXml').text();
            },
            /**
             * @returns {String}
             */
            getRefreshButtonVisible: function () {
                return this._getJqueryObj().children('refreshButtonVisible').text();
            },
            /**
             * @returns {String}
             */
            getAllowAuditButton: function () {
                return this._getJqueryObj().children('allowAuditButton').text();
            }
        });
})(Backbone);