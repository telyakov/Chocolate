var AbstractView = (function (Backbone, $, _, storageModule, undefined, helpersModule, optionsModule) {
    'use strict';
    return Backbone.View.extend({
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
            this.listenTo(this.model, 'openMailClient', this.openMailClient);
            this.listenTo(this.model, 'openWizardTask', this.openWizardTask);
            this.render();
        },
        $el: null,
        model: null,
        view: null,
        formID: null,
        _refreshTimerID: null,
        _autoUpdateTimerID: null,
        jqueryForm: null,
        $closeCardLink: null,
        footerTemplate: _.template([
                '<footer class="grid-footer" data-id="grid-footer">',
                '<div class="footer-info" data-id="info"></div>',
                '<div class="footer-counter"></div>',
                '</footer>'
            ].join('')
        ),
        cardButtonsTemplate: _.template([
            '<div class="card-action-button" data-id="action-button-panel">',
            '<input class="card-save" data-id="card-save" type="button" value="Сохранить"/>',
            '<input class="card-cancel" data-id="card-cancel" type="button" value="Отменить"/>'
        ].join('')),
        openWizardTask: function () {
            mediator.publish(optionsModule.getChannel('logError'),
                {
                    model: this,
                    error: 'not implemented openWizardTask method'
                }
            );
        },
        saveCard: function (opts) {
            mediator.publish(optionsModule.getChannel('logError'),
                {
                    model: this,
                    opts: opts,
                    error: 'not implemented saveCard method'
                }
            );
        },
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
        getFormID: function () {
            return this.formID;
        },
        getJqueryForm: function () {
            if (this.jqueryForm === null) {
                this.jqueryForm = $('#' + this.formID);
            }
            return this.jqueryForm;
        },
        generateCardID: function (id) {
            return ['card_', this.model.getView(), id].join('');
        },
        getCardCaption: function (pk) {
            var caption = this.model.getCardTabCaption();
            if ($.isNumeric(pk)) {
                caption += ' [' + pk + ']';
            } else {
                caption += '[новая запись]';
            }
            return caption;
        },
        openCardHandler: function (pk) {
            var view = this.model.getView(),
                $tabs = $('#tabs'),
                cardID = this.generateCardID(pk),
                $a = $tabs.find("li[data-tab-id='" + cardID + "']").children('a'),
                tab,
                _this = this;
            if ($a.length) {
                tab = facade.getFactoryModule().makeChTab($a);
                $tabs.tabs({active: tab.getIndex()});
            } else {
                var viewID = this.getFormID(),
                    caption = this.getCardCaption(pk),
                    $li = $('<li>', {
                        'data-tab-id': cardID,
                        'data-id': pk,
                        'data-view': view,
                        'html': facade.getTabsModule().createTabLink('', caption)
                    });
                this.addCloseCardEventListener($li);
                facade.getTabsModule().push($li);
                $tabs.children('ul').append($li);
                $tabs.tabs('refresh');

                $tabs.tabs({
                    beforeLoad: function (event, ui) {
                        ui.jqXHR.abort();
                        var cardView = new CardView({
                            model: _this.model,
                            view: _this,
                            id: pk,
                            $el: ui.panel
                        });
                        cardView.render(view, pk, viewID);
                    }
                });

                $a = $li.children('a');
                tab = facade.getFactoryModule().makeChTab($a);
                $tabs.tabs({active: tab.getIndex()});
                var href = '#' + tab.getPanelID(),
                    $context = $(href);
                facade.getRepaintModule().reflowCard($context);
                this.initCardScripts($context, pk);
                $a.attr('href', href);
            }
        },

        addCloseCardEventListener: function ($li) {
            var _this = this;
            _this.$closeCardLink = $li;
            this.$closeCardLink
                .on('click', '.tab-closed', function () {
                    _this.destroy();
                    facade.getTabsModule().close($(this));
                    return false;
                })
                .on('touchmove', function () {
                    _this.destroy();
                    facade.getTabsModule().close($(this));
                    return false;
                });
        },
        destroyCloseCardEventListener: function () {
            if(this.$closeCardLink){
                this.$closeCardLink.off('click');
            }
        },
        destroy: function () {
            storageModule.removeFromSession(this.model.cid);
            this.destroyCloseCardEventListener();
            this.model.stopListening();
            delete this.$el;
            delete this.model;
            delete this.view;
            delete this.formID;
            delete this._refreshTimerID;
            delete this._autoUpdateTimerID;
            delete this.jqueryForm;
            delete this.$closeCardLink;
            delete this.footerTemplate;
            delete this.cardButtonsTemplate;
        },
        initCardScripts: function ($cnt, pk) {
            var _this = this;
            $cnt
                .addClass(optionsModule.getClass('card'))
                .children('div').tabs({
                    beforeLoad: function (e, ui) {
                        if (!ui.tab.data('loaded')) {
                            var key = $(ui.tab).attr('data-id'),
                                card = _this.model.getCardROCollection().findWhere({
                                    key: key
                                });
                            _this.createCardPanel(card, $(ui.panel), pk);
                            ui.tab.data('loaded', 1);
                        }
                        return false;
                    },
                    cache: true
                });
        },
        createCardPanel: function (card, $panel, pk) {
            var html = {},
                callbacks = [],
                event = 'render_' + helpersModule.uniqueID(),
                elements = this.model.getCardElements(card, this),
                length = elements.length,
                asyncTaskCompleted = 0,
                $div = $('<div>', {
                    'class': 'card-content',
                    'data-id': 'card-control',
                    'id': helpersModule.uniqueID(),
                    'data-rows': card.getRows()
                });
            $panel.html($div);
            if (card.hasSaveButtons()) {
                $panel.append(this.cardButtonsTemplate());
            }

            $.subscribe(event, function (e, data) {
                var x = data.x,
                    y = data.y,
                    text = data.html;
                if (!html.hasOwnProperty(y)) {
                    html[y] = {};
                }
                html[y][x] = text;

                if (data.callback) {
                    callbacks.push(data.callback);
                }
                asyncTaskCompleted++;
                if (asyncTaskCompleted === length) {
                    $.unsubscribe(event);
                    var cardHtml = '';
                    var i,
                        j,
                        hasOwn = Object.hasOwnProperty;
                    for (i in html) {
                        if (hasOwn.call(html, i)) {
                            for (j in html[i]) {
                                if (hasOwn.call(html[i], j)) {
                                    cardHtml += html[i][j];
                                }
                            }
                        }
                    }
                    $div.html(cardHtml);
                    callbacks.forEach(function (fn) {
                        fn();
                    });
                    setTimeout(function () {
                        mediator.publish(optionsModule.getChannel('reflowTab'));
                    }, 0);
                }
            });
            var i = 0;
            elements.each(function (model) {
                model.render(event, i, card, pk);
                i++;
            });
        },
        getActualDataFromStorage: function (id) {
            if (id === undefined) {
                return helpersModule.merge(
                    this.getDBDataFromStorage(),
                    this.getChangedDataFromStorage()
                );
            } else {
                return helpersModule.merge(
                    this.getDBDataFromStorage()[id],
                    this.getChangedDataFromStorage()[id]
                );
            }

        },
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
            var recordset = $.extend(true, {}, this.getDBDataFromStorage(), this.getChangedDataFromStorage());
            $.when.apply($, deferTasks).done(function (data) {
                var listData = {};
                Array.prototype.slice.call(arguments).forEach(function (res) {
                    listData[res.key] = res.data;
                });
                if (!$.isEmptyObject(listData)) {
                    var hasOwn = Object.prototype.hasOwnProperty,
                        i,
                        k
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
        openFormSettings: function (e) {
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
                }),
            //todo: move int to constants
                $styleInput = $('<select/>', {
                    html: '<option value="1">Стандартный</option><option value="2">Мобильный</option>'
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
                            var $this = $(this);
                            _this.setAutoUpdate($input.is(':checked'));
                            _this.setFormStyleID(parseInt($styleInput.val(), 10));
                            $this.dialog("close");
                            $this.remove();
                        }
                    },
                    Отмена: {
                        'text': 'Отмена',
                        'class': 'wizard-cancel-button',
                        click: function () {
                            var $this = $(this);
                            $this.dialog('close');
                            $this.remove();
                        }
                    }

                }
            });
            $dialog.dialog('open');
        },
        getDBDataFromStorage: function (id) {
            if (id === undefined) {
                return this.getStorage().data;
            } else {
                return this.getStorage().data[id];
            }
        },
        addDeletedToStorage: function (id) {
            this.getDeletedDataFromStorage()[id] = true;
        },
        addChangeToStorage: function (id, data) {
            if (this.getChangedDataFromStorage()[id] !== undefined) {
                data = $.extend({}, this.getChangedDataFromStorage()[id], data);
            }
            this.getChangedDataFromStorage()[id] = data;
        },
        getChangedDataFromStorage: function () {
            return this.getStorage().changed;
        },
        getDeletedDataFromStorage: function () {
            return this.getStorage().deleted;
        },
        isAutoUpdate: function () {
            var key = this.model.getView();
            if (storageModule.hasSetting(key, 'auto_update')) {
                return storageModule.getSettingByKey(key, 'auto_update') ? true : false;
            } else {
                return false;
            }
        },
        isShortMode: function () {
            var key = this.model.getView();
            return storageModule.getSettingByKey(key, 'shortVisibleMode') ? true : false;
        },
        setShortMode: function (val) {
            storageModule.persistSetting(this.model.getView(), 'shortVisibleMode', val);
        },
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
        setFormStyleID: function (val) {
            storageModule.persistSetting(this.model.getView(), 'globalStyle', val);
        },
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
        stopAutoUpdate: function () {
            if (this._autoUpdateTimerID !== null) {
                clearInterval(this._autoUpdateTimerID);
            }
        },
        setAutoUpdate: function (val) {
            storageModule.persistSetting(this.model.getView(), 'auto_update', val);
            if (val) {
                this.startAutoUpdate();
            } else {
                this.stopAutoUpdate();
            }
        },
        hasSettings: function () {
            return !$.isEmptyObject(this.getFormSettingsFromStorage());
        },
        persistColumnsSettings: function (settings) {
            storageModule.persistColumnsSettings(this.model.getView(), settings);
        },
        getFormSettingsFromStorage: function () {
            var settings = storageModule.getSettings(),
                key = this.model.getView();
            if (!settings.hasOwnProperty(key)) {
                settings[key] = {};
            }
            return settings[key];
        },
        persistData: function (data, order) {
            storageModule.addToSession(this.model.cid, {
                data: data,
                order: order,
                changed: {},
                deleted: {}
            });
        },
        getStorage: function () {
            var cid = this.model.cid;
            if (!storageModule.hasSession(cid)) {
                storageModule.addToSession(cid, {
                    data: {},
                    order: [],
                    changed: {},
                    deleted: {}
                });
            }
            return storageModule.getSession(cid);

        },
        hasChange: function () {
            helpersModule.leaveFocus();
            return !$.isEmptyObject(this.getChangedDataFromStorage()) || !$.isEmptyObject(this.getDeletedDataFromStorage());
        },
        save: function (opts) {
//            validate = function (data) {
//                var requiredFields = this.getRequiredObj(),
//                    errors = [];
//                for (var field in requiredFields) {
//                    if (typeof(data[field]) == 'undefined' || !data[field]) {
//                        errors.push(field);
//                    }
//                }
//                return errors;
//            };
//            getMessagesContainer = function () {
//                if (this._ch_messages_container === null) {
//                    this._ch_messages_container = facade.getFactoryModule().makeChMessagesContainer(this.$form.find(".messages-container"));
//                }
//                return this._ch_messages_container;
//            };
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
        refresh: function () {
            mediator.publish(optionsModule.getChannel('logError'),
                {
                    model: this,
                    error: 'not implemented refresh method'
                }
            );
        },
        showMessage: function () {
            mediator.publish(optionsModule.getChannel('logError'),
                {
                    model: this,
                    error: 'not implemented showMessage method'
                }
            );
        },
        render: function () {
            mediator.publish(optionsModule.getChannel('logError'),
                {
                    model: this,
                    error: 'not implemented render method'
                }
            );
        },
        change: function (opts) {
            mediator.publish(optionsModule.getChannel('logError'),
                {
                    model: this,
                    error: 'not implemented change method'
                }
            );
        },
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