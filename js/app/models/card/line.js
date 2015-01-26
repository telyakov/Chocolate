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
            }
        });
})(CardElement);