/**
 * Creates a new ActionProperties.
 * @class
 */
var ActionProperties = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend(
        /** @lends ActionProperties */
        {
            defaults: {
                $obj: null
            },
            /**
             * @private
             * @returns {jQuery}
             */
            _getJqueryObj: function () {
                return this.get('$obj');
            },
            /**
             * @method destroy
             */
            destroy: function () {
                this.set('$obj', null);
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
            getAction: function () {
                return this._getJqueryObj().children('action').text();
            },
            /**
             * @returns {String}
             */
            getRequiredRole: function () {
                return this._getJqueryObj().children('requiredRole').text();
            }
        });
})(Backbone);