/**
 * Class AbstractView
 * @class
 */
var AbstractView = (function (Backbone, $, _, storageModule, undefined, helpersModule, optionsModule) {
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
             * @param id {String}
             */
            openCardHandler: function (id) {
                var cardView = this.getOpenedCard(id);
                if (cardView !== undefined) {
                    cardView.setWindowActive();
                } else {
                    var _this = this;
                    cardView = new CardView({
                        model: _this.model,
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
             * @param $settings {jQuery|null}
             * @private
             */
            _persistLinkToJquerySettings: function ($settings) {
                this._$settings = $settings;
            },
            /**
             * @private
             */
            _destroyDialogSettings: function () {
                if (this._$settings) {
                    this._$settings.dialog('destroy');
                    delete this._$settings;
                }
            },
            /**
             * @method exportToExcel
             */
            exportToExcel: function () {
                var settings = this.getFormSettingsFromStorage(),
                    prepareSettings = {},
                    model = this.model,
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
                var recordset = $.extend(true, {}, this.model.getDBDataFromStorage(), this.model.getChangedDataFromStorage());
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
             * @method openFormSettings
             */
            openFormSettings: function () {
                this._destroyDialogSettings();
                var $dialog = $('<div/>'),
                    $content = $('<div />', {'class': 'grid-settings'}),
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
                if (this.isAutoUpdate()) {
                    $input.attr('checked', 'checked');
                }
                $styleInput.find('[value="' + this.getFormStyleID() + '"]').attr('selected', true);
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
                                _this.setAutoUpdate($input.is(':checked'));
                                _this.setFormStyleID(parseInt($styleInput.val(), 10));
                                $(this).dialog("close");
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
             * @returns {boolean}
             */
            isAutoUpdate: function () {
                var key = this.model.getView();
                if (storageModule.hasSetting(key, 'auto_update')) {
                    return storageModule.getSettingByKey(key, 'auto_update') ? true : false;
                } else {
                    return false;
                }
            },
            /**
             * @returns {boolean}
             */
            isShortMode: function () {
                var key = this.model.getView();
                return storageModule.getSettingByKey(key, 'shortVisibleMode') ? true : false;
            },
            /**
             * @param val {boolean}
             */
            setShortMode: function (val) {
                storageModule.persistSetting(this.model.getView(), 'shortVisibleMode', val);
            },
            /**
             * @returns {Number}
             */
            getFormStyleID: function () {
                var key = this.model.getView();
                if (storageModule.hasSetting(key, 'globalStyle')) {
                    return storageModule.getSettingByKey(key, 'globalStyle');
                } else {
                    if (this.model.getView() === optionsModule.getConstants('tasksForTopsXml')) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            },
            /**
             * @param val {Number}
             */
            setFormStyleID: function (val) {
                storageModule.persistSetting(this.model.getView(), 'globalStyle', val);
            },
            /**
             * @method startAutoUpdate
             */
            startAutoUpdate: function () {
                if (this._autoUpdateTimerID === null) {
                    var _this = this;
                    this._autoUpdateTimerID = setInterval(function () {
                        if (_this.getJqueryForm().is(':visible') && !this.hasChange()) {
                            _this.model.trigger('refresh:form');
                        }
                    }, optionsModule.getSetting('defaultAutoUpdateMS'));
                }
            },
            /**
             * @method stopAutoUpdate
             */
            stopAutoUpdate: function () {
                if (this._autoUpdateTimerID !== null) {
                    clearInterval(this._autoUpdateTimerID);
                }
            },
            /**
             * @param val {boolean}
             */
            setAutoUpdate: function (val) {
                storageModule.persistSetting(this.model.getView(), 'auto_update', val);
                if (val) {
                    this.startAutoUpdate();
                } else {
                    this.stopAutoUpdate();
                }
            },
            /**
             * @returns {boolean}
             */
            hasSettings: function () {
                return !$.isEmptyObject(this.getFormSettingsFromStorage());
            },
            /**
             * @param settings {Object}
             */
            persistColumnsSettings: function (settings) {
                storageModule.persistColumnsSettings(this.model.getView(), settings);
            },
            /**
             * @returns {Object}
             */
            getFormSettingsFromStorage: function () {
                var settings = storageModule.getSettings(),
                    key = this.model.getView();
                if (!settings.hasOwnProperty(key)) {
                    settings[key] = {};
                }
                return settings[key];
            },
            /**
             * @param data {Object}
             * @param order {Array}
             */
            persistData: function (data, order) {
                storageModule.addToSession(this.model.cid, {
                    data: data,
                    order: order,
                    changed: {},
                    deleted: {}
                });
            },
            /**
             * @returns {boolean}
             */
            hasChange: function () {
                helpersModule.leaveFocus();
                return !$.isEmptyObject(this.model.getChangedDataFromStorage()) || !$.isEmptyObject(this.model.getDeletedDataFromStorage());
            },
            /**
             * @param opts {Object}
             * @abstract
             */
            save: function (opts) {
//            var ChResponseStatus = {
//                SUCCESS: 0,
//                ERROR: 1,
//                WARNING: 2
//            };
//            ChMessagesContainer.prototype = {
//                sendMessage: function (status_msg, status_code) {
//                    switch (status_code) {
//                        case ChResponseStatus.ERROR:
//                            this._sendErrorMessage(status_msg);
//                            break;
//                        case ChResponseStatus.SUCCESS:
//                            this._sendSuccessMessage(status_msg, 5000);
//                            break;
//                        case ChResponseStatus.WARNING:
//                            this._sendWarningMessage(status_msg)
//                            break;
//                        default:
//                            this._sendErrorMessage(status_msg);
//                            break;
//                    }
//                },
//                _sendSuccessMessage: function (status_msg, duration) {
//                    this._appendMessage('<div class="grid-message"><div class="alert in alert-block fade alert-success">' + status_msg + '</div></div>', duration);
//                },
//                _appendMessage: function (html, duration) {
//                    var $message = this.$message_container;
//                    $message.html(html);
//                    if (duration) {
//
//                        setTimeout(function () {
//                            $message.html('')
//                        }, duration);
//                    }
//                },
//                _sendErrorMessage: function (status_msg) {
//                    this._appendMessage('<div class="grid-message"><div class="alert in alert-block fade alert-error">' + status_msg + '</div></div>', 5000);
//                },
//                _sendWarningMessage: function (status_msg) {
//                    this._appendMessage('<div class="grid-message"><div class="alert in alert-block fade alert-warning">' + status_msg + '</div></div>', 5000);
//                }
//            };


                mediator.publish(optionsModule.getChannel('logError'),
                    {
                        model: this,
                        opts: opts,
                        error: 'not implemented save method'
                    }
                );
            },
            /**
             * @abstract
             */
            refresh: function () {
                mediator.publish(optionsModule.getChannel('logError'),
                    {
                        model: this,
                        error: 'not implemented refresh method'
                    }
                );
            },
            /**
             * @abstract
             */
            showMessage: function () {
                mediator.publish(optionsModule.getChannel('logError'),
                    {
                        model: this,
                        error: 'not implemented showMessage method'
                    }
                );
            },
            /**
             * @abstract
             */
            render: function () {
                mediator.publish(optionsModule.getChannel('logError'),
                    {
                        model: this,
                        error: 'not implemented render method'
                    }
                );
            },
            /**
             * @param opts {Object}
             * @abstract
             */
            change: function (opts) {
                mediator.publish(optionsModule.getChannel('logError'),
                    {
                        model: this,
                        error: 'not implemented change method'
                    }
                );
            },
            /**
             * @abstract
             */
            openWizardTask: function () {
                mediator.publish(optionsModule.getChannel('logError'),
                    {
                        model: this,
                        error: 'not implemented openWizardTask method'
                    }
                );
            },
            /**
             * @abstract
             */
            saveCard: function (opts) {
                mediator.publish(optionsModule.getChannel('logError'),
                    {
                        model: this,
                        opts: opts,
                        error: 'not implemented saveCard method'
                    }
                );
            },
            /**
             * @abstract
             */
            openMailClient: function () {
                mediator.publish(optionsModule.getChannel('logError'),
                    {
                        model: this,
                        error: 'not implemented openMailClient method'
                    }
                );
            }

        });
})
(Backbone, jQuery, _, storageModule, undefined, helpersModule, optionsModule);