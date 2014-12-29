var FilterDynatreeView = (function (Backbone, $) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this, 'render');
            //this.$el = options.$el;
            this.model = options.model;
            //this.render();
        },
        events: {},
        render: function (opts) {
            console.log('render tree filter');
            //dnt.buildFromSql(opts);
            this.model.buildFromSql(opts);

        }
    });
})
(Backbone, jQuery);