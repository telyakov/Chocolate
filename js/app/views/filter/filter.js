var FilterView = (function (Backbone, $) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.model = options.model;
            this.id = options.id;
        },
        render: function(event, i){

        }
    });
})(Backbone, jQuery);