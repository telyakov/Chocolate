var AbstractView = (function (undefined, Backbone, $, _, storageModule, helpersModule, optionsModule, deferredModule) {
    'use strict';
    return Backbone.View.extend(
        /** @lends AbstractView */
        {
            footerTemplate: _.template([
                    '<footer class="grid-footer" data-id="grid-footer">',
                    '<div class="footer-info"></div>',
                    '<div class="footer-counter"></div>',
                    '</footer>'
                ].join('')
            ),
            events: {
                'click .menu-button-settings': 'openFormSettings',
                'click .menu-button-expand': 'changeFullScreenMode',
                'click .menu-button-action': '_openContextMenu',
                'click .menu-button-excel': 'exportToExcel',
                'click .menu-button-print': '_openContextMenu'
            },
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
                this._refreshTimerID = 0;
                this._autoUpdateTimerID = 0;
                this._$form = null;
                this._$settings = null;
                this._formID = facade.getHelpersModule().uniqueID();
                this.listenTo(model, 'refresh:form', this._lazyRefresh);
                this.listenTo(model, 'save:form', this.save);
                this.listenTo(model, 'change:form', this.change);
                this.listenTo(model, 'save:card', this.saveCard);
                this.listenTo(model, 'open:card', this._openCard);
                this.listenTo(model, 'openMailClient', this.openMailClient);
                this.listenTo(model, 'openWizardTask', this.openWizardTask);
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
             * @returns {FormView}
             */
            getView: function () {
                return this.view;
            },
            /**
             * @description Perform save form data to db
             * @param {SaveDTO} opts
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
             * @param {RefreshDTO} opts
             * @description Perform the update form
             * @abstract
             */
            refresh: function (opts) {
                this.publishError({
                    model: this,
                    error: 'not implemented refresh method'
                });
            },
            /**
             * @description Show application message in form
             * @param {MessageDTO} opts
             * @override
             */
            showMessage: function (opts) {
                /**
                 *
                 * @type {jQuery}
                 */
                var $output = this._getJqueryMessageContainer(),
                    messageClass;
                switch (opts.id) {
                    case 1:
                        messageClass = 'alert-success';
                        break;
                    case 2:
                        messageClass = 'alert-warning';
                        break;
                    case 3:
                        messageClass = 'alert-error';
                        break;
                }
                /**
                 * @type {jQuery}
                 */
                var $msg = $('<div>', {
                    'class': 'alert in alert-block fade ' + messageClass,
                    html: opts.msg
                }).wrap('<div class="grid-message"></div>');
                $output.html($msg);
                var duration = 5000;
                if (opts.id === 3) {
                    duration = 15000;
                }
                if (this._messageTimerID) {
                    clearTimeout(this._messageTimerID);
                }
                this._messageTimerID = setTimeout(function () {
                    $output.html('')
                }, duration);
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
             * @param {FormChangeDTO} opts
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
             * @param {CardSaveDTO} opts
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
             * @param {Object} opts custom object
             * @fires mediator#logError
             */
            publishError: function (opts) {
                mediator.publish(optionsModule.getChannel('logError'), opts);
            },
            /**
             * @description Open dialog with form settings
             */
            openFormSettings: function () {
                this._destroyDialogSettings();
                /**
                 *
                 * @type {FormModel}
                 */
                var model = this.getModel();
                var $autoUpdate = $('<div></div>', {
                        'class': 'setting-item',
                        html: '<span class="setting-caption">Автоматические обновление данных(раз в 100 секунд)</span>'
                    }),
                    $input = $('<input/>', {type: 'checkbox'}),
                    $styleSettings = $('<div></div>', {
                        'class': 'setting-item',
                        html: '<span class="setting-caption">Выбрать дизайн(необходимо обновить страницу, после изменения)</span>'
                    });
                var htmlStyle = [
                        '<option value="',
                        optionsModule.getConstants('standardDesignType'),
                        '">Стандартный</option><option value="',
                        optionsModule.getConstants('mobileDesignType'),
                        '">Мобильный</option>'
                    ].join(''),
                    $styleInput = $('<select></select>', {
                        html: htmlStyle
                    }),
                    _this = this;
                if (model.isAutoUpdate()) {
                    $input.attr('checked', 'checked');
                }
                $styleInput.find('[value="' + model.getFormStyleID() + '"]').attr('selected', true);
                $styleSettings.append($styleInput);
                $autoUpdate.append($input);
                var $content = $('<div></div>', {'class': 'grid-settings'});
                $content
                    .append($styleSettings)
                    .append($autoUpdate);
                var $dialog = $('<div></div>');
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
                                model.setFormStyleID(parseInt($styleInput.val(), 10));
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
                        if (_this.getJqueryForm().is(':visible') && !_this.hasChange()) {
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
             * @param {boolean} val
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
                    var key = item.key,
                        _this = this;
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
                                    .fail(
                                    /** @param {string} error */
                                        function (error) {
                                        _this.showMessage({
                                            id: 3,
                                            msg: error
                                        });
                                    });
                            })(task);
                        }
                    }
                });
                this._publishExportToExcelEvent(asyncTasks, prepareSettings);
            },

            /**
             * @param {FileDTO} data
             */
            fileDownloadResponseHandler: function (data) {
                /**
                 * @see https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript/16245768#16245768?newreg=b55ed913d6004b79b3a7729fc72a9aad
                 */
                var byteCharacters = atob(helpersModule.arrayBufferToBase64(data.data)),
                    charactersLength = byteCharacters.length,
                    byteArrays = [],
                    sliceSize = 512,
                    offset,
                    slice,
                    sliceLength,
                    byteNumbers,
                    i;

                for (offset = 0; offset < charactersLength; offset += sliceSize) {
                    slice = byteCharacters.slice(offset, offset + sliceSize);
                    sliceLength = slice.length;
                    byteNumbers = [];
                    for (i = 0; i < sliceLength; i += 1) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }
                    byteArrays.push(new Uint8Array(byteNumbers));
                }
                saveAs(new Blob(byteArrays, {}), data.name);
            },
            /**
             * @description Get Jquery object, where shows form messages
             * @returns {jQuery}
             * @private
             */
            _getJqueryMessageContainer: function () {
                return this.getJqueryForm().find('.menu').children('.messages-container');
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
                    _this = this,
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
                                            if (extraData[k][oldVal] === undefined) {
                                                data[i][k] = oldVal;
                                            } else {
                                                data[i][k] = extraData[k][oldVal].name;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        var asyncTask = deferredModule.create();
                        mediator.publish(optionsModule.getChannel('socketExportToExcel'), {
                            name: model.getCaption() + '.xls',
                            settings: JSON.stringify(settings),
                            data: JSON.stringify(data),
                            type: optionsModule.getRequestType('deferred'),
                            id: deferredModule.save(asyncTask)
                        });
                        asyncTask
                            .done(_this.fileDownloadResponseHandler)
                            .fail(function (error) {
                                _this.showMessage({
                                    id: 3,
                                    msg: error
                                });
                            });
                    })
                    .fail(
                    /** @param {string} error */
                        function (error) {
                        _this.showMessage({
                            id: 3,
                            msg: error
                        });
                    });
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
                    this.refresh(opts);
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
             * @description Open context menu
             * @param e {Event}
             * @private
             */
            _openContextMenu: function (e) {
                /**
                 * @type {jQuery}
                 */
                var $this = $(e.target).closest('button');
                $this.contextmenu('open', $this);
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
            }
        });
})
(undefined, Backbone, jQuery, _, storageModule, helpersModule, optionsModule, deferredModule);