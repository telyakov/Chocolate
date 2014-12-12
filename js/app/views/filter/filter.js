var FilterView = (function (Backbone, $) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.model = options.model;
            this.form = options.form;
            this.id = options.id;
            if(options.$el){
                this.$el = options.$el;
            }
        },
        render: function(event, i){

        }
    });
})(Backbone, jQuery);