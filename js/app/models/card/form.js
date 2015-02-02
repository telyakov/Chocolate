/**
 * Class FormCardElement
 * @class
 * @augments CardElement
 */
var FormCardElement = (function ($, optionsModule, mediator, CardElement) {
    'use strict';
    return CardElement.extend(
        /** @lends FormCardElement */
        {
            /**
             * @method destroy
             * @override
             */
            destroy: function () {
                //todo: leak memory, when open child form
                this.constructor.__super__.destroy.apply(this, arguments);
            },
            /**
             * @override
             * @protected
             * @returns {number}
             */
            _getMinHeight: function () {
                return 215;
            },
            /**
             * @override
             * @protected
             * @returns {Boolean}
             */
            _isStatic: function () {
                return false;
            },
            /**
             * @override
             * @protected
             * @returns {String}
             */
            _renderBeginData: function () {
                return '<div class="card-input card-grid ' + this.getEditClass() + '">';
            },
            /**
             * @override
             * @protected
             * @returns {String}
             */
            _renderLabel: function () {
                return '';
            },
            /**
             * @override
             * @protected
             * @returns {String}
             */
            _renderControl: function (pk, controlID, tabindex) {
                return '<section id="' + controlID + '"></section>';
            },
            /**
             * @override
             * @param controlID {String}
             * @param pk {String}
             * @returns {Function}
             * @protected
             */
            _getCallback: function (controlID, pk) {
                var _this = this,
                    column = _this.getColumn(),
                    view = column.getView();
                return function () {
                    mediator.publish(optionsModule.getChannel('openForm'), {
                        $el: $('#' + controlID),
                        view: view,
                        parentModel: _this.get('model'),
                        parentID: pk,
                        card: _this
                    });
                };
            }
        });
})(jQuery, optionsModule, mediator, CardElement);