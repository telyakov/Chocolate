var FormView = (function (Backbone, $, optionsModule, mediator, helpersModule) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.$el = options.$el;
            this.model = options.model;
            this.render();
        },
        events: {
        },

        render: function () {
            this.createPanel();
        },
        createPanel: function(){
            var id = helpersModule.uniqueID(),
                $div = $('<div>',{
                id: id
            });
            this.$el.append($div);
            facade.getTabsModule().addAndSetActive(id, this.model.getCaption());

        }
    });
})(Backbone, jQuery, optionsModule, mediator, helpersModule);