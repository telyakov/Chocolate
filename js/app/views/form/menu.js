var MenuView = (function (Backbone, $, _, window, helpersModule, optionsModule) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.$el = options.$el;
            this.view = options.view;
            this.model = options.view.model;
            this.render();
        },
        events: {},
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
            '<% if (isAllowPrintActions) { %>',
            '<button class="active menu-button menu-button-print small-button" title="Печать" type="button" id="<%= printID %>">',
            '<span class="fa fa-print"></span>',
            '</button>',
            '<% } %>',
            '<button class="active menu-button menu-button-settings small-button" title="Настройки" type="button">',
            '<span class="fa-wrench"></span>',
            '</button>',
            '<% if (isAllowPrintActions) { %>',
            '<button class="active menu-button menu-button-toggle small-button" title="Показать системные поля" type="button" id="<%= auditID %>">',
            '<span class="fa-user"></span>',
            '</button>',
            '<% } %>',
            '<button class="active menu-button menu-button-action small-button" title="Действия" type="button" id="<%= actionID %>">',
            '<span class="fa-level-down"></span>',
            '</button>',
            '<% if (isSearchColumnVisible) { %>',
            '<input type="search" class="grid-column-search" placeholder="Поиск колонки">',
            '<% } %>',
            '<div class="messages-container"></div>',
            '</menu>'
        ].join('')),
        render: function () {
            var printID = helpersModule.uniqueID(),
                isAllowPrintActions = this.model.isAllowPrintActions(),
                isAllowAudit = this.model.isAllowAudit(),
                auditID = helpersModule.uniqueID(),
                actionID = helpersModule.uniqueID(),
                html = this.template({
                    isAllowCreate: this.model.isAllowCreate(),
                    isAllowSave: this.model.isAllowSave(),
                    isAllowRefresh: this.model.isAllowRefresh(),
                    isAllowPrintActions: isAllowPrintActions,
                    printID: printID,
                    isAllowAudit: isAllowAudit,
                    auditID: auditID,
                    actionID: actionID,
                    isSearchColumnVisible: this.model.isSearchColumnVisible()
                });
            this.$el.append(html);
            if (isAllowPrintActions) {
                this.initPrintActions(printID);
            }
            if (isAllowAudit) {
                this.systemColsInit(auditID);
            }
            this.initActions(actionID);
        },
        systemColsInit: function (sysColsID) {
            var $btn = $('#' + sysColsID);
            if (!this.view.isSystemColumnsMode()) {
                $btn.addClass(optionsModule.getClass('menuButtonSelected'));
            }
        },
        initPrintActions: function (id) {
            var view = this.view,
                printActions = this.model.getPrintActions(),
                $actionButton = $('#' + id);

            $actionButton.contextmenu({
                show: {effect: "blind", duration: 0},
                menu: printActions,
                select: function (event, ui) {
                    var url = ui.cmd;
                    if (/[IdList]/.test(url)) {
                        var idList = '',
                            rows = view.getSelectedRows(),
                            lng = rows.length;
                        for (var i = 0; i < lng; i++) {
                            idList += rows[i].attr('data-id') + ' ';
                        }
                        url = url.replace(/\[IdList\]/g, idList);
                    }
                    window.open(url);
                }
            });
        },
        initActions: function (id) {
            var actionsProperties = this.model.getActionProperties(),
                $actionButton = $('#' + id),
                view = this.view;
            $actionButton.contextmenu({
                show: {effect: "blind", duration: 0},
                menu: actionsProperties.getData(),
                select: function (event, ui) {
                    switch (ui.cmd) {
                        case 'window.print':
                            window.print();
                            break;
                        case 'ch.export2excel':
                            view.exportToExcel();
                            break;
                        case 'ch.settings':
                            view.openFormSettings();
                            break;
                    }
                }
            });
        }
    });
})(Backbone, jQuery, _, window, helpersModule, optionsModule);