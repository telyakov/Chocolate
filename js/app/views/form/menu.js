var MenuView = (function (Backbone) {
    'use strict';
    return Backbone.View.extend({
        template: _.template([
            '<menu class="menu" type="toolbar">',
            '<% if (isAllowCreate) { %>',
            '<button class="active menu-button menu-button-add" title="Создать" type="button">',
            '<span class="menu-border-green"></span><span>Создать</span>',
            '</button>',
            '<% } %>',
            '<% if (isAllowSave) { %>',
            '<button class="menu-button menu-button-save" title="Сохранить" type="button">',
            '<span>Сохранить</span>',
            '</button>',
            '<% } %>',
            '<% if (isAllowRefresh) { %>',
            '<button class="active menu-button menu-button-refresh" title="Обновить" type="button">',
            '<span>Обновить</span>',
            '</button>',
            '<% } %>',
            '<button class="active menu-button menu-button-expand small-button" title="Увеличить\\Уменьшить основную информацию" type="button">',
            '<span class="fa-expand"></span>',
            '</button>',
            '<button class="active menu-button menu-button-excel small-button" title="Экспорт в Excel" type="button">',
            '<span class="fa-file-excel-o"></span>',
            '</button>',
            '</menu>'
        ].join('')),
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.$el = options.$el;
            this.model = options.model;
            this.render();
        },
        events: {},

        render: function () {
            var html = this.template({
                isAllowCreate: this.model.isAllowCreate(),
                isAllowSave: this.model.isAllowSave(),
                isAllowRefresh: this.model.isAllowRefresh()
                //isAllowRefresh: this.model.isAllowRefresh(),
            });
            console.log(this.$el)
            this.$el.append(html);
        }
    });
})(Backbone);