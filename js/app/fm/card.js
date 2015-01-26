var Card = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend(
        /** @lends Card */
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
            getCaption: function () {
                return this._getJqueryObj().children('caption').text();
            },
            /**
             * @returns {String}
             */
            getKey: function () {
                return this._getJqueryObj().children('key').text();
            },
            /**
             * @returns {String}
             */
            getCols: function () {
                return this._getJqueryObj().children('cols').text();
            },
            /**
             * @returns {String}
             */
            getRows: function () {
                return this._getJqueryObj().children('rows').text();
            },
            /**
             * @returns {String}
             */
            getCol: function () {
                return this._getJqueryObj().children('col').text();
            },
            /**
             * @returns {String}
             */
            getRow: function () {
                return this._getJqueryObj().children('row').text();
            },
            /**
             * @returns {String}
             */
            getCellWidth: function () {
                return this._getJqueryObj().children('cellWidth').text();
            },
            /**
             * @returns {String}
             */
            getCellHeight: function () {
                return this._getJqueryObj().children('cellHeight').text();
            },
            /**
             * @returns {String}
             */
            getFixedWidth: function () {
                return this._getJqueryObj().children('fixedWidth').text();
            },
            /**
             * @returns {String}
             */
            getFixedHeight: function () {
                return this._getJqueryObj().children('fixedHeight').text();
            },
            /**
             * @returns {String}
             */
            getCaptionReadProc: function () {
                return this._getJqueryObj().children('captionReadProc').text();
            },
            /**
             * @returns {String}
             */
            getVisible: function () {
                return this._getJqueryObj().children('visible').text();
            }
        });
})(Backbone);