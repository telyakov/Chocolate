var GridView = (function (Backbone) {
    'use strict';
    return Backbone.View.extend({
        template: _.template([
                '<form action="/grid/save?view=<%=view %>" data-id="<%= view %>" id="<%= id %> "',
                'data-parent-id="<%= parentID%>" ',
                'data-ajax-add="<%= ajaxAdd%>" ',
                'data-tab-caption="<%= tabCaption%>" ',
                'data-parent-pk="<%= parentPk%>" ',
                'data-card-support="<%= cardSupport%>" ',
                '>',
                '</form>'
            ].join('')
        ),
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.$el = options.$el;
            this.model = options.model;
            this.render();
        },
        events: {},

        render: function () {
            var formId = helpersModule.uniqueID(),
                html = this.template({
                    id: formId,
                    view: this.model.getView()
                });
            this.layoutMenu();
            this.layoutForm();
        },
        layoutMenu: function () {

        },
        layoutForm: function () {

        }
    });
})(Backbone);