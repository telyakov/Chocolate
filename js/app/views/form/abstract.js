var AbstractView = (function (Backbone, $, _, storageModule, undefined, helpersModule, optionsModule) {
    'use strict';
    return Backbone.View.extend({
        $el: null,
        model: null,
        view: null,
        formID: null,
        initialize: function (options) {
            _.bindAll(this);
            this.$el = options.$el;
            this.model = options.model;
            this.view = options.view;
            this.formID = facade.getHelpersModule().uniqueID();
            this.listenTo(this.model, 'refresh:form', this.lazyRefresh);
            this.listenTo(this.model, 'save:form', this.save);
            this.listenTo(this.model, 'change:form', this.change);
            this.listenTo(this.model, 'openMailClient', this.openMailClient);
            this.render();
        },
        openMailClient: function () {
            console.log('not implemented openMailClient method');
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
        _refreshTimerID: null,
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
        jqueryForm: null,
        getJqueryForm: function () {
            if (this.jqueryForm === null) {
                this.jqueryForm = $('#' + this.formID);
            }
            return this.jqueryForm;
        },
        _chForm: null,
        getChForm: function () {
            //todo: for support legacy code
            if (this._chForm === null) {
                this._chForm = facade.getFactoryModule().makeChGridForm(this.getJqueryForm());
            }
            return this._chForm;
        },
        footerTemplate: _.template([
                '<footer class="grid-footer" data-id="grid-footer">',
                '<div class="footer-info" data-id="info"></div>',
                '<div class="footer-counter"></div>',
                '</footer>'
            ].join('')
        ),
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
                facade.getTabsModule().push($li);
                $tabs.children('ul').append($li);
                $tabs.tabs('refresh');

                $tabs.tabs({
                    beforeLoad: function (event, ui) {
                        ui.jqXHR.abort();
                        var cardView = new CardView({
                            model: _this.model,
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
                this.initCardScripts($context);
                $a.attr('href', href);
            }
        },
        initCardScripts: function ($cnt) {
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
                            _this.createCardPanel(card, $(ui.panel));
                            ui.tab.data('loaded', 1);
                        }
                        return false;
                    },
                    cache: true
                });
        },
        cardButtonsTemplate: _.template([
            '<div class="card-action-button" data-id="action-button-panel">',
            '<input class="card-save" data-id="card-save" type="button" value="Сохранить"/>',
            '<input class="card-cancel" data-id="card-cancel" type="button" value="Отменить"/>'
        ].join('')),
        createCardPanel: function (card, $panel) {
            var html = {},
                callbacks = [],
                event = 'render_' + helpersModule.uniqueID(),
                elements = this.model.getCardElements(card),
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
            var i = 0,
                pk = this.id;
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
                //todo: как будет переделано хранилище - оптимизировать код
                return helpersModule.merge(
                    this.getDBDataFromStorage(),
                    this.getChangedDataFromStorage()
                )[id];
            }

        },
        getDBDataFromStorage: function (id) {
            if (id === undefined) {
                return this.getStorage().data;
            } else {
                return this.getStorage().data[id];
            }
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
        _autoUpdateTimerID: null,
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
            storageModule.addToSession(this.getFormID(), {
                data: data,
                order: order,
                changed: {},
                deleted: {}
            });
        },
        getStorage: function () {
            var formID = this.getFormID();
            if (!storageModule.hasSession(formID)) {
                storageModule.addToSession(formID, {
                    data: {},
                    order: [],
                    changed: {},
                    deleted: {}
                });
            }
            return storageModule.getSession(formID);

        },
        hasChange: function () {
            helpersModule.leaveFocus();
            return !$.isEmptyObject(this.getChangedDataFromStorage()) || !$.isEmptyObject(this.getDeletedDataFromStorage());
        },
        save: function (data) {
            mediator.publish(optionsModule.getChannel('logError'),
                {
                    model: this,
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
        }
    });
})
(Backbone, jQuery, _, storageModule, undefined, helpersModule, optionsModule);