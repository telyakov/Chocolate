var MultimediaCardElement = (function () {
    'use strict';
    return CardElement.extend({
        getMinHeight: function () {
            return 300;
        },
        isStatic: function () {
            return false;
        },
        renderBeginData: function () {
            return '<div class="card-input card-grid' + this.getEditClass() + '">';
        }
    });
})();