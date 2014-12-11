var CanvasView = (function (Backbone) {
    'use strict';
    return AbstractView.extend({
        render: function () {
            console.log('рендерю канвас');
        }
    });
})(Backbone);