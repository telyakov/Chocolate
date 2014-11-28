var CanvasView = (function (Backbone) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.$el = options.$el;
            this.model = options.model;
            this.render();
        },
        events: {},

        render: function () {
            console.log('рендерю канвас');
        }
    });
})(Backbone);