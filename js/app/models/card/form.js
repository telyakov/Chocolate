var FormCardElement = (function ($, optionsModule) {
    'use strict';
    return CardElement.extend({
        getMinHeight: function () {
            return 215;
        },
        isStatic: function () {
            return false;
        },
        renderBeginData: function () {
            return '<div class="card-input card-grid ' + this.getEditClass() + '">';
        },
        processBeforeRender: function () {
            return '';
        },
        renderControl: function (pk, controlID, tabindex) {
            return '<section id="' + controlID + '"></section>';
        },
        getCallback: function (controlID, pk) {
            var _this = this,
                column = _this.get('column'),
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
})(jQuery, optionsModule);