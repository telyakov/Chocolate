var FormView = (function (Backbone, $, optionsModule, mediator, helpersModule) {
    'use strict';
    return Backbone.View.extend({
        dataParentId: null,
        headerTemplate: _.template([
            '<section class="section-header" data-id="header">',
            '<div class="top-header">',
            '<div class="left-header">',
            '<%= image %>',
            '</div>',
            '<div class="right-header">',
            '<%= title %>',
            '</div>',
            '</div>',
            '<div class="bottom-header" id="<%= asyncId %>">',
            '</div>',
            '</section>'
        ].join('')),
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.$el = options.$el;
            this.model = options.model;
            if (options.dataParentId) {
                this.dataParentId = options.dataParentId;
            }
            this.render();
        },
        events: {},

        render: function () {
            var $panel = this.createPanel();
            this.layoutHeader($panel);
            this.layoutFilters($panel);
            this.layoutForm($panel);
        },
        createPanel: function () {
            var id = helpersModule.uniqueID(),
                $panel = $('<div>', {
                    id: id
                });
            this.$el.append($panel);
            facade.getTabsModule().addAndSetActive(id, this.model.getCaption());
            return $panel;

        },
        layoutHeader: function ($panel) {
            if (this.model.hasHeader()) {
                var asyncId = helpersModule.uniqueID(),
                    image = facade.getImageAdapter().convert(this.model.getImage()),
                    title = this.model.getHeaderText();

                $panel.append(this.headerTemplate({
                    'image': image,
                    'title': title,
                    'asyncId': asyncId
                }));
                var stateProcedure = this.model.getStateProc();
                if (stateProcedure) {
                    mediator.publish(optionsModule.getChannel('socketRequest'), {
                        query: stateProcedure,
                        type: optionsModule.getRequestType('jquery'),
                        id: asyncId
                    });
                }
            }

        },
        layoutFilters: function ($panel) {
            if(this.model.hasFilters()){
                var html = [];
                this.model.getFiltersROCollection().each(function(item){
                    html.push(item.render());
                });
                $panel.append(html.join(''));
            }

        },
        layoutForm: function ($panel) {

        }
    });
})(Backbone, jQuery, optionsModule, mediator, helpersModule);