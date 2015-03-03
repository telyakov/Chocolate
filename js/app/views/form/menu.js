var MenuView = (function (Backbone, $, _, window, helpersModule, optionsModule) {
    'use strict';
    return Backbone.View.extend(
        /** @lends MenuView */
        {
            template: _.template([
                '<menu class="menu" type="toolbar">',
                '<div class="messages-container"></div>',
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
                '<% if (isAllowAudit) { %>',
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
                '</menu>'
            ].join('')),
            /**
             * @class MenuView
             * @param {Object} options
             * @augments Backbone.View
             * @constructs
             */
            initialize: function (options) {
                _.bindAll(this);
                this.$el = options.$el;
                this.view = options.view;
                this.model = options.view.model;
                this._$printActionButton = null;
                this._$actionButton = null;
            },
            /**
             * @desc destroy
             */
            destroy: function () {
                this.undelegateEvents();
                this._destroyPrintActionsEvent();
                this._destroyActionsButtonEvent();
                this.template = null;
                this.$el = null;
                this.view = null;
                this.model = null;
            },
            /**
             * @returns {FormModel}
             */
            getModel: function () {
                return this.model;
            }, /**
             * @method render
             */
            render: function () {
                var printID = helpersModule.uniqueID(),
                    model = this.getModel(),
                    isAllowPrintActions = model.isAllowPrintActions(),
                    isAllowAudit = model.isAllowAudit(),
                    auditID = helpersModule.uniqueID(),
                    actionID = helpersModule.uniqueID(),
                    html = this.template({
                        isAllowCreate: model.isAllowCreate(),
                        isAllowSave: model.isAllowSave(),
                        isAllowRefresh: model.isAllowRefresh(),
                        isAllowPrintActions: isAllowPrintActions,
                        printID: printID,
                        isAllowAudit: isAllowAudit,
                        auditID: auditID,
                        actionID: actionID,
                        isSearchColumnVisible: model.isSearchColumnVisible()
                    });
                this.$el.append(html);
                if (isAllowPrintActions) {
                    this._initPrintActions(printID);
                }
                if (isAllowAudit) {
                    this._systemColsInit(auditID);
                }
                this._initActions(actionID);
            },
            /**
             * @param {string} sysColsID
             * @private
             */
            _systemColsInit: function (sysColsID) {
                var $btn = $('#' + sysColsID);
                if (!this.getModel().isSystemColumnsMode()) {
                    $btn.addClass(optionsModule.getClass('menuButtonSelected'));
                }
            },
            /**
             * @param {jQuery} $button
             * @private
             */
            _persistLinkToPrintActionButton: function ($button) {
                this._$printActionButton = $button;
            },
            /**
             * @private
             */
            _destroyPrintActionsEvent: function () {
                if (this._$printActionButton) {
                    this._$printActionButton.contextmenu('destroy');
                    this._$printActionButton = null;
                }
            },
            /**
             * @param {string} id
             * @private
             */
            _initPrintActions: function (id) {
                var view = this.view,
                    printActions = this.getModel().getPrintActions(),
                    $actionButton = $('#' + id);
                this._persistLinkToPrintActionButton($actionButton);
                $actionButton.contextmenu({
                    show: {effect: "blind", duration: 0},
                    menu: printActions,
                    select: function (event, ui) {
                        var url = ui.cmd;
                        if (/[IdList]/.test(url)) {
                            var idList = '',
                                rows = view.getSelectedRows(),
                                lng = rows.length;
                            for (var i = 0; i < lng; i += 1) {
                                idList += rows[i].attr('data-id') + ' ';
                            }
                            url = url.replace(/\[IdList]/g, idList);
                        }
                        window.open(url);
                    }
                });
            },
            /**
             * @private
             */
            _destroyActionsButtonEvent: function () {
                if (this._$actionButton) {
                    this._$actionButton.contextmenu('destroy');
                    this._$actionButton = null;
                }
            },
            /**
             * @param {jQuery} $button
             * @private
             */
            _persistLinkToActionButton: function ($button) {
                this._$actionButton = $button;
            },
            /**
             * @param {string} id
             * @private
             */
            _initActions: function (id) {
                var actionsProperties = this.getModel().getActionProperties(),
                    $actionButton = $('#' + id),
                    view = this.view;
                this._persistLinkToActionButton($actionButton);
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