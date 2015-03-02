/**
 * Class LineCardElement
 * @class
 * @augments CardElement
 */
var LineCardElement = (function (CardElement) {
    'use strict';
    return CardElement.extend(
        /** @lends LineCardElement */
        {
            /**
             * @override
             * @protected
             * @returns {String}
             */
            _renderControl: function () {
                return '';
            },
            /**
             * @override
             * @returns {string}
             * @protected
             */
            _renderBeginData: function () {
                return '';
            },
            /**
             * @override
             * @returns {string}
             * @protected
             */
            _renderEndData: function () {
                return '';
            },
            /**
             * @override
             * @returns {Number}
             * @protected
             */
            _getMinHeight: function () {
                return 20;
            },
            /**
             * @protected
             * @override
             * @returns {Function}
             */
            _getCallback: function () {
                return function () {
                };
            }
        });
})(CardElement);