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
        gridTemplate: _.template([
                '<section data-id="grid">',
                '<div data-id="user-grid" id="<%= userGridID %>" class="grid-view">',
                '<table tabindex=0 class="table-bordered items">',
                '<thead><tr>',
                '<% _.each(rows, function(item) { %>',
                '<th ',
                '<% _.each(item.options, function(value, name) { %>',
                '<%= name%>',
                '="',
                '<%= value%>',
                '" ',
                ' <% }); %>',
                '><%= item.header%></th>',
                ' <% }); %>',
                '</tr></thead>',
                '<tbody>',
                '</tbody>',
                '</table>',
                '</div>',
                '</section>'
            ].join('')
        ),
        columnHeaderTemplate: _.template([
                '<div><a><span class="<%= class %>"></span>',
                '<span class="grid-caption">',
                '<%= caption%>',
                '</span><span class="grid-sorting"></span>',
                '</a></div>'
            ].join('')
        ),
        footerTemplate: _.template([
                '<footer class="grid-footer" data-id="grid-footer">',
                '<div class="footer-info" data-id="info"></div>',
                '<div class="footer-counter"></div>',
                '</footer>'
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
            this.layoutForm($form);
            this.layoutFooter($form);
            mediator.publish(optionsModule.getChannel('reflowTab'));
        },
        layoutMenu: function ($form) {
            var menuView = new MenuView({
                model: this.model,
                $el: $form
            });
        },
        layoutForm: function ($form) {
            var _this = this,
                roCollection = this.model.getColumnsROCollection(),
                rows = [{
                    options: {'data-id': 'chocolate-control-column'},
                    header: ''
                }],
                userGridID = helpersModule.uniqueID();
            roCollection.each(function (column) {
                rows.push({
                    options: column.getHeaderOptions(),
                    header: _this.columnHeaderTemplate({
                        'class': column.getHeaderCLass(),
                        caption: column.getCaption()
                    })
                });
            });
            $form.append(this.gridTemplate({
                userGridID: userGridID,
                rows: rows
            }));

        },
        layoutFooter: function ($form) {
            $form.after(this.footerTemplate());
        }
    });
})(Backbone);