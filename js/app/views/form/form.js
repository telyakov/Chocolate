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
        filterTemplate: _.template([
            '<div class="filters-content">',
            '<%= html %>',
            '</div>'
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
            var _this = this;
            if (this.model.hasFilters()) {
                var $filterSection = $('<section>',{
                    'class': 'section-filters',
                    'data-id': 'filters'
                });
                $panel.append($filterSection);
                var html = [],
                    callbacks= [],
                    event = 'render_' + helpersModule.uniqueID(),
                    ROCollections = this.model.getFiltersROCollection(),
                    length = ROCollections.length,
                    asyncTaskCompleted = 0;
                $.subscribe(event, function (e, data) {
                    html[data.counter] = data.text;
                    if(data.callback){
                        callbacks.push(data.callback);
                    }
                    asyncTaskCompleted++;
                    if (asyncTaskCompleted === length|| asyncTaskCompleted === 8) {
                        $.unsubscribe(event);
                        $filterSection.append(
                            _this.filterTemplate({
                                html: '<div><ul class="filters-list">' + html.join('') + '</div></ul></div>'
                            })
                        );
                        callbacks.forEach(function(fn){
                            fn();
                        });

                    }
                });
                ROCollections.each(function (item, i) {
                    item.render(event, i, ROCollections);
                });

            }

        },
        layoutForm: function ($panel) {
            //view = encodeURI(_private.toXmlExtensionFormat(view));
            //if (view.indexOf('map.xml') !== -1) {
            //    url = '/map/index?view=' + view;
            //}
            //else if (view.indexOf('flatsgramm.xml') !== -1) {
            //    url = '/canvas/index?view=' + view;
            //} else {
            //    url = '/grid/index?view=' + view;
            //}
        }
    });
})(Backbone, jQuery, optionsModule, mediator, helpersModule);