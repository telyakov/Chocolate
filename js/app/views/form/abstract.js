/**
 * Class AbstractView
 * @class
 */
var AbstractView = (function (undefined, Backbone, $, _, storageModule, helpersModule, optionsModule, deferredModule) {
    'use strict';
    return Backbone.View.extend(
        /** @lends AbstractView */
        {
            /**
             *
             * @private
             */
            initialize: function (options) {
                _.bindAll(this);
                this.$el = options.$el;
                this.model = options.model;
                this.view = options.view;
                this.formID = facade.getHelpersModule().uniqueID();
                this.listenTo(this.model, 'refresh:form', this.lazyRefresh);
                this.listenTo(this.model, 'save:form', this.save);
                this.listenTo(this.model, 'change:form', this.change);
                this.listenTo(this.model, 'save:card', this.saveCard);
                this.listenTo(this.model, 'open:card', this.openCardHandler);
                this.listenTo(this.model, 'openMailClient', this.openMailClient);
                this.listenTo(this.model, 'openWizardTask', this.openWizardTask);
                this.render();
            },
            _refreshTimerID: null,
            _autoUpdateTimerID: null,
            _$form: null,
            _$settings: null,
            _openedCards: [],
            footerTemplate: _.template([
                    '<footer class="grid-footer" data-id="grid-footer">',
                    '<div class="footer-info" data-id="info"></div>',
                    '<div class="footer-counter"></div>',
                    '</footer>'
                ].join('')
            ),
            /**
             * @method destroy
             */
            destroy: function () {
                this._destroyDialogSettings();
                storageModule.removeFromSession(this.model.cid);
                this.stopListening(this.model);
                delete this._openedCards;
                delete this.$el;
                delete this.model;
                delete this.view;
                delete this.formID;
                delete this._refreshTimerID;
                delete this._autoUpdateTimerID;
                delete this._$form;
                delete this.footerTemplate;
                this.events = null;
            },
            /**
             * @param e {Event}
             */
            contentExpandHandler: function (e) {
                var $this = $(e.target).closest('button'),
                    $expandSection = $this.closest('section');
                $this.toggleClass('menu-button-selected');
                $expandSection.siblings('.section-header, .section-filters').toggleClass('expand-hidden');
                var $expandCardCol = $expandSection.closest('.card-col');
                if ($expandCardCol.length) {
                    $expandCardCol.toggleClass('expand-card-visible');
                    $expandCardCol.siblings('.card-col').toggleClass('expand-hidden');
                }
                mediator.publish(optionsModule.getChannel('reflowTab'), true);
            },
            /**
             * @param opts {Object}
             */
            lazyRefresh: function (opts) {
                var isLazy = opts && opts.isLazy ? true : false;
                if (isLazy) {
                    if (this._refreshTimerID) {
                        clearTimeout(this._refreshTimerID);
                    }
                    var _this = this;
                    this._refreshTimerID = setTimeout(function () {
                        _this.refresh();
                    }, 900);
                } else {
                    this.refresh();
                }
            },
            /**
             * @returns {String}
             */
            getFormID: function () {
                return this.formID;
            },
            /**
             * @returns {jQuery}
             */
            getJqueryForm: function () {
                if (this._$form === null) {
                    this._$form = $('#' + this.formID);
                }
                return this._$form;
            },
            /**
             * @param id {string}
             * @returns {string}
             */
            generateCardID: function (id) {
                return ['card_', this.model.getView(), id].join('');
            },
            /**
             * @param view {CardView}
             * @private
             */
            _addOpenedCard: function (view) {
                this._openedCards[view.id] = view;
            },
            /**
             * @param id {String}
             */
            deleteOpenedCard: function (id) {
                delete this._openedCards[id];
            },
            /**
             * @param id {string}
             * @returns {CardView|undefined}
             */
            getOpenedCard: function (id) {
                return this._openedCards[id];
            },
            /**
             * @description Open card
             * @param id {String} Unique row key
             */
            openCardHandler: function (id) {
                var cardView = this.getOpenedCard(id);
                if (cardView !== undefined) {
                    cardView.setWindowActive();
                } else {
                    var _this = this;
                    cardView = new CardView({
                        model: _this.getModel(),
                        view: _this,
                        id: id
                    });
                    helpersModule.getTabsObj().tabs({
                        beforeLoad: function (event, ui) {
                            ui.jqXHR.abort();
                            if (!ui.tab.data('loaded')) {
                                _this._addOpenedCard(cardView);
                                cardView.render(id, ui.panel);
                                ui.tab.data('loaded', 1);
                            }
                        }
                    });
                    cardView.setWindowActive();
                    facade.getRepaintModule().reflowCard(cardView.$el);
                    cardView.initScripts();
                }
            },
            /**
             * @description Persist reference to initialized settings dialog. To prevent leak memory.
             * @param $settings {jQuery|null}
             * @private
             */
            _persistLinkToJquerySettings: function ($settings) {
                this._$settings = $settings;
            },
            /**
             * @description Destroy previously initialized by dialog settings
             * @private
             */
            _destroyDialogSettings: function () {
                if (this._$settings) {
                    this._$settings.dialog('destroy');
                    delete this._$settings;
                }
            },
            /**
             * @description Export form data into Excel file(file.xsl)
             * @fires mediator#socketExportToExcel
             */
            exportToExcel: function () {
                var prepareSettings = {},
                    model = this.getModel(),
                    settings = model.getFormSettingsFromStorage(),
                    collection = model.getColumnsROCollection(),
                    deferTasks = [];
                settings.forEach(function (item) {
                    var key = item.key,
                        column = collection.findWhere({key: key});
                    if (column) {
                        prepareSettings[key] = $.extend({}, item);
                        prepareSettings[key].key = column.getFromKey();
                        prepareSettings[key].caption = column.getVisibleCaption();
                        if (column.getEditType().indexOf('valuelist') !== -1) {
                            var defer = deferredModule.create();
                            deferTasks.push(defer);
                            (function (defer) {
                                column.receiveData().done(function (res) {
                                    defer.resolve({
                                        data: res.data,
                                        key: key
                                    });
                                })
                            })(defer);
                        }
                    }
                });
                var recordset = $.extend(true, {}, model.getDBDataFromStorage(), modell.getChangedDataFromStorage());
                $.when.apply($, deferTasks).done(function (data) {
                    var listData = {};
                    Array.prototype.slice.call(arguments).forEach(function (res) {
                        listData[res.key] = res.data;
                    });
                    if (!$.isEmptyObject(listData)) {
                        var hasOwn = Object.prototype.hasOwnProperty,
                            i,
                            k;
                        for (i in recordset) {
                            if (hasOwn.call(recordset, i)) {
                                for (k in recordset[i]) {
                                    if (hasOwn.call(recordset[i], k)) {
                                        if (listData.hasOwnProperty(k)) {
                                            var oldVal = recordset[i][k];
                                            recordset[i][k] = listData[k][oldVal].name;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    mediator.publish(optionsModule.getChannel('socketExportToExcel'), {
                        name: model.getCaption() + '.xls',
                        settings: JSON.stringify(prepareSettings),
                        data: JSON.stringify(recordset),
                        id: 1
                    });
                });
            },
            /**
             * @description Open dialog with form settings
             */
            openFormSettings: function () {
                this._destroyDialogSettings();
                var $dialog = $('<div/>'),
                    $content = $('<div/>', {'class': 'grid-settings'}),
                    $autoUpdate = $('<div/>', {
                        'class': 'setting-item',
                        html: '<span class="setting-caption">Автоматические обновление данных(раз в 100 секунд)</span>'
                    }),
                    $input = $('<input/>', {
                        type: 'checkbox'
                    }),
                    $styleSettings = $('<div/>', {
                        'class': 'setting-item',
                        html: '<span class="setting-caption">Выбрать дизайн(необходимо обновить страницу, после изменения)</span>'
                    });
                var styleHtml = [
                        '<option value="',
                        optionsModule.getConstants('standardDesignType'),
                        '">Стандартный</option><option value="',
                        optionsModule.getConstants('mobileDesignType'),
                        '">Мобильный</option>'
                    ].join(''),
                    $styleInput = $('<select/>', {
                        html: styleHtml
                    }),
                    _this = this;
                if (this.model.isAutoUpdate()) {
                    $input.attr('checked', 'checked');
                }
                $styleInput.find('[value="' + this.model.getFormStyleID() + '"]').attr('selected', true);
                $styleSettings.append($styleInput);
                $autoUpdate.append($input);
                $content
                    .append($styleSettings)
                    .append($autoUpdate);
                $dialog.append($content);
                $dialog.dialog({
                    resizable: false,
                    title: 'Настройки',
                    dialogClass: 'wizard-dialog',
                    modal: true,
                    buttons: {
                        OK: {
                            'text': 'OK',
                            'class': 'wizard-active wizard-next-button',
                            click: function () {
                                _this.changeAutoUpdate($input.is(':checked'));
                                _this.model.setFormStyleID(parseInt($styleInput.val(), 10));
                                $(this).dialog('close');
                            }
                        },
                        Отмена: {
                            'text': 'Отмена',
                            'class': 'wizard-cancel-button',
                            click: function () {
                                $(this).dialog('close');
                            }
                        }

                    }
                });
                $dialog.dialog('open');
                this._persistLinkToJquerySettings($dialog);
            },
            /**
             * @description Start autoUpdate process
             */
            startAutoUpdate: function () {
                if (this._autoUpdateTimerID === null) {
                    var _this = this;
                    this._autoUpdateTimerID = setInterval(function () {
                        if (_this.getJqueryForm().is(':visible') && !this.hasChange()) {
                            _this.getModel().trigger('refresh:form');
                        }
                    }, optionsModule.getSetting('defaultAutoUpdateMS'));
                }
            },
            /**
             * @description Stop autoUpdate process
             */
            stopAutoUpdate: function () {
                if (this._autoUpdateTimerID !== null) {
                    clearInterval(this._autoUpdateTimerID);
                }
            },
            /**
             * @returns {FormModel}
             */
            getModel: function () {
                return this.model;
            },
            /**
             * @description Persist AutoUpdate param to local storage and start autoUpdate process, if value===true
             * @param val {boolean}
             */
            changeAutoUpdate: function (val) {
                storageModule.persistSetting(this.getModel().getView(), 'auto_update', val);
                if (val) {
                    this.startAutoUpdate();
                } else {
                    this.stopAutoUpdate();
                }
            },
            /**
             * @description Indicates whether there is a change in the form
             * @returns {boolean}
             */
            hasChange: function () {
                helpersModule.leaveFocus();
                var model = this.getModel();
                return !$.isEmptyObject(model.getChangedDataFromStorage()) || !$.isEmptyObject(model.getDeletedDataFromStorage());
            },
            /**
             * @description Perform save form data to db
             * @param opts {SaveDTO}
             * @abstract
             */
            save: function (opts) {
                this.publishError({
                    model: this,
                    opts: opts,
                    error: 'not implemented save method'
                });
            },
            /**
             * @description Perform the update form
             * @abstract
             */
            refresh: function () {
                this.publishError({
                    model: this,
                    error: 'not implemented refresh method'
                });
            },
            /**
             * @description Show application message to user
             * @param opts {MessageDTO}
             * @abstract
             */
            showMessage: function (opts) {
                this.publishError({
                    model: this,
                    opts: opts,
                    error: 'not implemented showMessage method'
                });
            },
            /**
             * @description the main method, that render view
             * @abstract
             */
            render: function () {
                this.publishError({
                    model: this,
                    error: 'not implemented render method'
                });
            },
            /**
             * @description Save changed data in form model to local storage
             * @param opts {FormChangeDTO}
             * @abstract
             */
            change: function (opts) {
                this.publishError({
                    model: this,
                    error: 'not implemented change method',
                    opts: opts
                });
            },
            /**
             * @description Open TaskWizard dialog
             * @abstract
             */
            openWizardTask: function () {
                this.publishError({
                    model: this,
                    error: 'not implemented openWizardTask method'
                });
            },
            /**
             * @description Save card data to database
             * @param opts {CardSaveDTO}
             * @abstract
             */
            saveCard: function (opts) {
                this.publishError({
                    model: this,
                    opts: opts,
                    error: 'not implemented saveCard method'
                });
            },
            /**
             * @description Opens the e-mail client
             * @abstract
             */
            openMailClient: function () {
                this.publishError({
                    model: this,
                    error: 'not implemented openMailClient method'
                });
            },
            /**
             * @description Send error event to mediator
             * @param opts {Object} custom object
             * @fires mediator#logError
             */
            publishError: function (opts) {
                mediator.publish(optionsModule.getChannel('logError'), opts);
            }
        });
})
(undefined, Backbone, jQuery, _, storageModule, helpersModule, optionsModule, deferredModule);