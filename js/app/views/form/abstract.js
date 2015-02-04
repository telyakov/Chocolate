var AbstractView = (function (undefined, Backbone, $, _, storageModule, helpersModule, optionsModule, deferredModule) {
    'use strict';
    return Backbone.View.extend(
        /** @lends AbstractView */
        {
            _refreshTimerID: 0,
            _autoUpdateTimerID: 0,
            _$form: null,
            _$settings: null,
            footerTemplate: _.template([
                    '<footer class="grid-footer" data-id="grid-footer">',
                    '<div class="footer-info"></div>',
                    '<div class="footer-counter"></div>',
                    '</footer>'
                ].join('')
            ),
            /**
             * @abstract
             * @class AbstractView
             * @augments Backbone.View
             * @param {AbstractViewOptions} options
             * @constructs
             */
            initialize: function (options) {
                var model = options.model;
                _.bindAll(this);
                this.$el = options.$el;
                this.model = model;
                this.view = options.view;
                this._formID = facade.getHelpersModule().uniqueID();
                this.listenTo(model, 'refresh:form', this._lazyRefresh);
                this.listenTo(model, 'save:form', this.save);
                this.listenTo(model, 'change:form', this.change);
                this.listenTo(model, 'save:card', this.saveCard);
                this.listenTo(model, 'open:card', this._openCard);
                this.listenTo(model, 'openMailClient', this.openMailClient);
                this.listenTo(model, 'openWizardTask', this.openWizardTask);
                this.render();
            },
            /**
             * @description Destroy class
             */
            destroy: function () {
                this._destroyDialogSettings();
                this.stopListening(this.model);
                delete this.$el;
                delete this.model;
                delete this.view;
                delete this._formID;
                delete this._refreshTimerID;
                delete this._autoUpdateTimerID;
                delete this._$form;
                delete this.footerTemplate;
                this.events = null;
            },
            /**
             * @returns {FormModel}
             */
            getModel: function () {
                return this.model;
            },
            /**
             * @description Disable/enable view mode to full screen
             * @param {Event} e  DOM event object
             */
            changeFullScreenMode: function (e) {
                var $this = $(e.target).closest('button'),
                    $expandSection = $this.closest('section');

                $this.toggleClass('menu-button-selected');

                $expandSection
                    .siblings('.section-header, .section-filters')
                    .toggleClass('expand-hidden');

                var $expandCardCol = $expandSection.closest('.card-col');
                if ($expandCardCol.length) {
                    $expandCardCol
                        .toggleClass('expand-card-visible')
                        .siblings('.card-col')
                        .toggleClass('expand-hidden');
                }
                mediator.publish(optionsModule.getChannel('reflowTab'), true);
            },
            /**
             * @description Get unique id <form>
             * @returns {String}
             */
            getFormID: function () {
                return this._formID;
            },
            /**
             * @description Return jQuery <form> tag
             * @returns {jQuery}
             */
            getJqueryForm: function () {
                if (this._$form === null) {
                    this._$form = $('#' + this.getFormID());
                }
                return this._$form;
            },
            /**
             * @description Perform refresh form data
             * @param {RefreshDTO} [opts]
             * @private
             */
            _lazyRefresh: function (opts) {
                var isLazy = opts && opts.isLazy ? true : false;
                if (isLazy) {
                    if (this._refreshTimerID) {
                        clearTimeout(this._refreshTimerID);
                    }
                    this._refreshTimerID = setTimeout(this.refresh, 900);
                } else {
                    this.refresh();
                }
            },
            /**
             * @description Open card
             * @param {String} id  Unique card key
             * @private
             */
            _openCard: function (id) {
                var model = this.getModel();
                if (model.hasCard()) {
                    var cardView = model.getOpenedCard(id);
                    if (cardView !== undefined) {
                        cardView.setWindowActive();
                    } else {
                        cardView = new CardView({
                            model: model,
                            view: this,
                            id: id
                        });
                        helpersModule.getTabsObj().tabs({
                            beforeLoad: function (event, ui) {
                                ui.jqXHR.abort();
                                if (!ui.tab.data('loaded')) {
                                    model.addOpenedCard(cardView);
                                    cardView.render(id, ui.panel);
                                    ui.tab.data('loaded', 1);
                                }
                            }
                        });
                        cardView.setWindowActive();
                        facade.getRepaintModule().reflowCard(cardView.$el);
                        cardView.initScripts();
                    }
                }
            },
            /**
             * @description Persist reference to initialized settings dialog. To prevent leak memory.
             * @param {?jQuery} $settings
             * @private
             */
            _persistReferenceToDialogSettings: function ($settings) {
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
                    asyncTasks = [];

                settings.forEach(function (item) {
                    var key = item.key;
                    /**
                     * @type {ColumnRO}
                     */
                    var column = collection.findWhere({key: key});

                    if (column) {
                        prepareSettings[key] = $.extend({}, item);
                        prepareSettings[key].key = column.getFromKey();
                        prepareSettings[key].caption = column.getVisibleCaption();
                        if (column.isValueListType()) {
                            var task = deferredModule.create();
                            asyncTasks.push(task);
                            (/** @param {Deferred} asyncTask */
                                function (asyncTask) {
                                column
                                    .startAsyncTaskGetData()
                                    .done(function (res) {
                                        asyncTask.resolve({
                                            data: res.data,
                                            key: key
                                        });
                                    })
                            })(task);
                        }
                    }
                });
                this._publishExportToExcelEvent(asyncTasks, prepareSettings);
            },
            /**
             *
             * @param {Deferred[]} asyncTasks
             * @param {Object} settings
             * @private
             * @fires mediator#socketExportToExcel
             */
            _publishExportToExcelEvent: function (asyncTasks, settings) {
                /**
                 * @type {FormModel}
                 */
                var model = this.getModel(),
                    data = $.extend(true, {}, model.getDBDataFromStorage(), model.getChangedDataFromStorage());
                $.when.apply($, asyncTasks)
                    .done(function () {
                        var extraData = {};
                        Array.prototype.slice.call(arguments).forEach(function (res) {
                            extraData[res.key] = res.data;
                        });
                        if (!$.isEmptyObject(extraData)) {
                            var hasOwn = Object.prototype.hasOwnProperty,
                                i,
                                k;
                            for (i in data) {
                                if (hasOwn.call(data, i)) {
                                    for (k in data[i]) {
                                        if (hasOwn.call(data[i], k) && extraData.hasOwnProperty(k)) {
                                            var oldVal = data[i][k];
                                            data[i][k] = extraData[k][oldVal].name;
                                        }
                                    }
                                }
                            }
                        }
                        mediator.publish(optionsModule.getChannel('socketExportToExcel'), {
                            name: model.getCaption() + '.xls',
                            settings: JSON.stringify(settings),
                            data: JSON.stringify(data),
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
                this._persistReferenceToDialogSettings($dialog);
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
                /**
                 * @type {FormModel}
                 */
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