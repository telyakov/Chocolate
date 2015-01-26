var ColumnProperties = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend(
        /** @lends ColumnProperties */
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
            getHeaderImage: function () {
                return this._getJqueryObj().children('headerimage').text();
            },
            /**
             * @returns {String}
             */
            getCaption: function () {
                return this._getJqueryObj().children('caption').text();
            },
            /**
             * @returns {String}
             */
            getDataSource: function () {
                return this._getJqueryObj().children('dataSource').text();
            },
            /**
             * @returns {String}
             */
            getAllFields: function () {
                return this._getJqueryObj().children('allFields').text();
            },
            /**
             * @returns {String}
             */
            getFromDataSource: function () {
                return this._getJqueryObj().children('fromDataSource').text();
            },
            /**
             * @returns {String}
             */
            getAllowEdit: function () {
                return this._getJqueryObj().children('allowEdit').text();
            },
            /**
             * @returns {String}
             */
            getViewBind: function () {
                return this._getJqueryObj().children('viewBind').text();
            },
            /**
             * @returns {String}
             */
            getFromName: function () {
                return this._getJqueryObj().children('fromName').text();
            },
            /**
             * @returns {String}
             */
            getToName: function () {
                return this._getJqueryObj().children('toName').text();
            },
            /**
             * @returns {String}
             */
            getFromId: function () {
                return this._getJqueryObj().children('fromId').text();
            },
            /**
             * @returns {String}
             */
            getToId: function () {
                return this._getJqueryObj().children('toId').text().toLowerCase();
            },
            /**
             * @returns {String}
             */
            getKey: function () {
                return this._getJqueryObj().children('key').text().toLowerCase();
            },
            /**
             * @returns {String}
             */
            getVisible: function () {
                return this._getJqueryObj().children('visible').text();
            },
            /**
             * @returns {String}
             */
            getEditType: function () {
                var type = $.trim(this._getJqueryObj().children('editType').text());
                if (type) {
                    return type.toLowerCase();
                } else {
                    return this.getCardEditType();
                }
            },
            /**
             * @returns {String}
             */
            getCardEditType: function () {
                return $.trim(this._getJqueryObj().children('cardEditType').text().toLowerCase());
            },
            /**
             * @returns {String}
             */
            getRequired: function () {
                return this._getJqueryObj().children('required').text();
            },
            /**
             * @returns {String}
             */
            getDefault: function () {
                return this._getJqueryObj().children('default').text();
            },
            /**
             * @returns {String}
             */
            getShowInRowDisplay: function () {
                return this._getJqueryObj().children('showInRowDisplay').text();
            },
            /**
             * @returns {String}
             */
            getTabId: function () {
                return this._getJqueryObj().children('tabId').text();
            },
            /**
             * @returns {String}
             */
            getFormat: function () {
                return this._getJqueryObj().children('format').text();
            },
            /**
             * @returns {String}
             */
            getSingleValueMode: function () {
                return this._getJqueryObj().children('singleValueMode').text();
            },
            /**
             * @returns {String}
             */
            getCardKey: function () {
                return this._getJqueryObj().children('cardKey').text();
            },
            /**
             * @returns {String}
             */
            getCardVisible: function () {
                return this._getJqueryObj().children('cardVisible').text();
            },
            /**
             * @returns {String}
             */
            getCardX: function () {
                return this._getJqueryObj().children('cardX').text();
            },
            /**
             * @returns {String}
             */
            getProperties: function () {
                return this._getJqueryObj().children('properties').text();
            },
            /**
             * @returns {String}
             */
            getEditBehavior: function () {
                return this._getJqueryObj().children('editBehavior').text();
            },
            /**
             * @returns {String}
             */
            getViewName: function () {
                return this._getJqueryObj().children('viewName').text();
            },
            /**
             * @returns {String}
             */
            getCardMultiLine: function () {
                return this._getJqueryObj().children('cardMultiLine').text();
            },
            /**
             * @returns {String}
             */
            getCardHeight: function () {
                return this._getJqueryObj().children('cardHeight').text();
            },
            /**
             * @returns {String}
             */
            getCardWidth: function () {
                return this._getJqueryObj().children('cardWidth').text();
            },
            /**
             * @returns {String}
             */
            getCardY: function () {
                return this._getJqueryObj().children('cardY').text();
            },
            /**
             * @returns {String}
             */
            getVisibleKey: function () {
                var toID = this.getToId();
                if (toID) {
                    return toID;
                } else {
                    return this.getKey();
                }
            }
        });
})(Backbone);