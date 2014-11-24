var FormView = (function (Backbone, $, optionsModule, mediator) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this, 'render');
            //this.$el = options.el;
            this.model = options.model;
            this.render();
        },
        events: {
        },

        render: function () {
            //console.log(this.model.getActionProperties());
            //console.log(this.model.getActionProperties());
            console.log(this.model.getCardCollection());
            console.log('render');
        }
    });
})(Backbone, jQuery, optionsModule, mediator);