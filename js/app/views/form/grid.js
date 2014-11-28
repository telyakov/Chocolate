var GridView = (function (Backbone) {
    'use strict';
    return Backbone.View.extend({
        template: _.template([
                '<form action="/grid/save?view=<%=view %>" data-id="<%= view %>" id="<%= id%>"',
                'data-parent-id="<%= parentID%>" ',
                'data-ajax-add="<%= ajaxAdd%>" ',
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
            if (options.dataParentId) {
                this.dataParentId = options.dataParentId;
            }
            this.render();
        },
        events: {},

        render: function () {
            var formId = helpersModule.uniqueID(),
                html = this.template({
                    id: formId,
                    view: this.model.getView(),
                    parentID: this.dataParentId,
                    ajaxAdd: this.model.isSupportCreateEmpty(),
                    parentPk: this.model.get('parentId'),
                    cardSupport: this.model.hasCard()

                });
            this.$el.append(html);
            var $form = $('#' + formId);
            this.layoutMenu($form);
            this.layoutForm();
        },
        layoutMenu: function ($form) {
            var menuView = new MenuView({
                model: this.model,
                $el: $form
            });
        },
        layoutForm: function ($form) {

        }
    });
})(Backbone);