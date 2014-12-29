var ColumnDynatreeView = (function (Backbone, $) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this, 'render');
            //this.$el = options.$el;
            this.model = options.model;
            //this.render();
        },
        events: {},
        render: function ($this, isSingle, title) {
            console.log('render tree column');
            var options = this.model.getDefaultOptions($this, isSingle);
            options.title = title;
            this.model.buildFromData(options);
        }
    });
})
(Backbone, jQuery);