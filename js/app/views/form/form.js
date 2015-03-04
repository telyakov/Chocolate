/**
 * Class FormView
 * @class
 * @augments Backbone.View
 */
var FormView = (function (Backbone, $, optionsModule, mediator, helpersModule) {
    'use strict';
    return Backbone.View.extend(
        /** @lends FormView */
        {
            headerTemplate: _.template([
                '<section class="section-header" data-id="header">',
                '<div class="top-header">',
                '<% if (image) { %>',
                '<div class="left-header">',
                '<%= image %>',
                '</div>',
                '<% }%>',
                '<div class="right-header">',
                '<%= title %>',
                '</div>',
                '</div>',
                '<div class="bottom-header" id="<%= asyncId %>">',
                '</div>',
                '</section>'
            ].join('')),
            filterTemplate: _.template([
                '<div class="filters-content">',
                '<form class="form-vertical filter-form" id="<%= formID %>">',
                '<%= html %>',
                '</form>',
                '</div>'
            ].join('')),
            events: function () {
                return {
                    'click .grid-button .editable': '_openChildForm',
                    'click .menu-button-refresh': $.debounce(1000, true, this._refreshHandler),
                    'keydown input.filter': function (e) {
                        if (e.keyCode === optionsModule.getKeyCode('enter')) {
                            this.getModel().trigger('refresh:form', {});
                            e.preventDefault();
                        }
                    },
                    'click .fm-email-send': function (e) {
                        this.getModel().trigger('openMailClient');
                        e.preventDefault();
                    },
                    'click .fm-wizard-task': function (e) {
                        this.getModel().trigger('openWizardTask', e);
                        e.preventDefault();
                    }
                };
            },
            /**
             * @class FormView
             * @param options
             * @private
             * @augments Backbone.View
             * @constructs
             */
            initialize: function (options) {
                _.bindAll(this);
                if (options.$card) {
                    this.$card = options.$card;
                }
                this._$settings = null;
                this.model = options.model;
                this.view = null;
                this._disposableFilterData = {};
                this.$closeLink = null;
                if (options.card) {
                    this.card = options.card;
                } else {
                    this.card = null;
                }
                this.$el = this._createPanel();
            },
            /**
             * @desc Destroy
             */
            destroy: function () {
                this._unbindCloseEventListener();
                this.undelegateEvents();

                this.headerTemplate = null;
                this.filterTemplate = null;
                this.$card = null;
                if (this._$settings) {
                    this._$settings.dialog('destroy');
                    this._$settings = null;
                }
                this.card = null;
                this.getModel().destroy();
                this.model = null;
                if (this.getView()) {
                    this.getView().destroy();
                    this.view = null;
                }
                delete this.$el; // Delete the jQuery wrapped object variable
                delete this.el; // Delete the variable reference to this node
                this.events = null;
                facade.getTabsModule().close(this.$closeLink.children('a'));
                this.$closeLink = null;
                this._disposableFilterData = null;
            },
            /**
             * @publuc
             * @param {Object} data
             */
            setDisposableFilterData: function(data){
                this._disposableFilterData = data;
            },
            /**
             * @returns {?AbstractView}
             */
            getView: function () {
                return this.view;
            },
            /**
             * @returns {FormModel}
             */
            getModel: function () {
                return this.model;
            },
            /**
             * @returns {?CardElement}
             */
            getCard: function () {
                return this.card;
            },
            /**
             * @public
             * @method setWindowActive
             */
            setWindowActive: function () {
                var _this = this;
                helpersModule.getTabsObj().tabs({
                    active: tabsModule.getIndex(_this.$closeLink)
                });
            },
            /**
             * @desc Render Form
             */
            render: function () {
                var $panel = this.$el,
                    _this = this,
                    model = this.getModel(),
                    asyncFiltersTask = $.Deferred();
                if (model.isAttachmentView()) {
                    var $section = $('<section>', {
                        'class': 'attachment-grid',
                        id: helpersModule.uniqueID()
                    });
                    $panel.append($section);
                    $panel = $section;
                }
                this
                    ._layoutHeader($panel)
                    ._layoutFilters($panel, asyncFiltersTask);
                $.when(asyncFiltersTask)
                    .done(function () {
                        _this._layoutFormSection($panel);
                        if (!model.isMapView()) {
                            mediator.publish(optionsModule.getChannel('reflowTab'), true);
                        }

                    })
                    .fail(
                    /** @param {string} error */
                        function (error) {
                        $panel.append(error);
                    })
            },
            /**
             * @desc Return data of filter form
             * @returns {Object}
             */
            getFilterData: function () {
                var disposableData = this._getDisposableFilterDataAndRemove();
                if(!$.isEmptyObject(disposableData)){
                    console.log(disposableData)
                    return disposableData;
                }
                var model = this.getModel(),
                    result = {};
                if (this._hasFilters()) {
                    var rawData = this.$el.find('.filter-form').serializeArray(),
                        value,
                        name;
                    var filters = model.getFiltersROCollection();
                    rawData.forEach(function (item) {
                            value = item.value;
                            name = item.name;
                            if (value) {
                                if (helpersModule.isMultiSelectFilter(name)) {
                                    name = name.slice(0, name.length - 2);
                                    var separator = '|';
                                    if (result.hasOwnProperty(name)) {
                                        result[name] += value + separator;
                                    } else {
                                        result[name] = value + separator;
                                    }
                                } else {
                                    /**
                                     * @type FilterRO
                                     */
                                    var filterModel = filters.findWhere({'key': name}),
                                        format;
                                    if(filterModel){
                                        format = filterModel.getValueFormat();
                                    }
                                    if (format === 'idlist') {
                                        result[name] = helpersModule.filterValueFormatToIDList(value);
                                    } else {
                                        result[name] = value;
                                    }
                                }
                            }
                        }
                    )
                }
                return result;
            },
            /**
             *
             * @returns {Object}
             * @private
             */
            _getDisposableFilterDataAndRemove: function(){
                var data = this._disposableFilterData;
                this._disposableFilterData = null;
                return data;
            },
            /**
             *
             * @returns {boolean}
             * @private
             */
            _hasFilters: function(){
                var model = this.getModel(),
                    cardElement = this.getCard(),
                    cardSql;
                if(cardElement){
                    cardSql = cardElement.getSql();
                }
                return model.hasFilters() && !cardSql;
            },
            /**
             * @param {String} id
             * @param {String} name
             * @returns {jQuery}
             * @private
             */
            _addTabAndSetActive: function (id, name) {
                var $item = this._addTab(id, name);
                helpersModule.getTabsObj().tabs({active: $item.index()});
                return $item;
            },
            /**
             * @returns {jQuery}
             * @private
             */
            _createPanel: function () {
                if (this.$card) {
                    return this.$card;
                }
                var id = helpersModule.uniqueID(),
                    $panel = $('<div>', {
                        id: id
                    });
                $('#tabs').append($panel);
                var $closeLink = this._addTabAndSetActive(id, this.getModel().getCaption());
                this._bindCloseEventListener($closeLink);
                return $panel;

            },
            /**
             * @param {jQuery} $closeLink
             * @private
             */
            _bindCloseEventListener: function ($closeLink) {
                this._persistReferenceToCloseLink($closeLink);
                var _this = this;
                this.$closeLink
                    .on('click', '.tab-closed', function (e, data) {
                        if (data && data.isFastClose) {
                            return false;
                        } else {
                            if (!_this.getView().hasChange() || confirm('Есть несохраненные данные. Вы уверены что хотите закрыть форму?')) {
                                _this.destroy();
                                return false;
                            }
                        }

                    })
                    .on('touchmove', function () {
                        _this.destroy();
                        return false;
                    });
            },

            /**
             * @description Persist reference to created AbstractView. To prevent leak memory.
             * @param {jQuery} $element
             * @private
             */
            _persistReferenceToCloseLink: function ($element) {
                this.$closeLink = $element;
            },
            /**
             * @desc unbind close event listener
             */
            _unbindCloseEventListener: function () {
                if (this.$closeLink) {
                    this.$closeLink.off('click');
                }
            },
            /**
             * @param {jQuery} $panel
             * @returns {*}
             * @private
             */
            _layoutHeader: function ($panel) {
                var title,
                    model = this.getModel();
                if (model.isAttachmentView()) {
                    title = model.parentModelIsNotSaved() ?
                        '<b>Сохраните строку, перед добавлением вложения</b>' :
                        [
                            '<b>Прикрепить файл</b> можно простым способом:',
                            '<li><b>Перенести файл мышкой</b> в область этой страницы</li>',
                            '<li><b>Нажать</b> кнопку <b>сохранить</b></li>'
                        ].join('');
                    $panel.append(this.headerTemplate({
                        image: '<span class="fa-paperclip"></span>',
                        title: title,
                        asyncId: null
                    }));
                } else {
                    if (model.hasHeader()) {
                        var asyncId = helpersModule.uniqueID(),
                            image = facade.getImageAdapter().convert(model.getImage());
                        title = model.getHeaderText();
                        $panel.append(this.headerTemplate({
                            image: image,
                            title: title,
                            asyncId: asyncId
                        }));
                        var stateProcedure = model.getStateProc();
                        if (stateProcedure) {
                            model.runAsyncTaskStateProcBind()
                                .done(
                                /** @param {SqlBindingResponse} res */
                                function(res){
                                    var asyncTask = deferredModule.create();
                                    mediator.publish(optionsModule.getChannel('socketRequest'), {
                                        query: res.sql,
                                        type: optionsModule.getRequestType('deferred'),
                                        id: deferredModule.save(asyncTask)
                                    });
                                    asyncTask
                                        .done(function (res) {
                                            var html = helpersModule.getFirstValue(res.data);
                                            $('#' + asyncId).html(html);
                                            mediator.publish(optionsModule.getChannel('reflowTab'), true);
                                        })
                                })
                                .fail(function(error){
                                    mediator.publish(optionsModule.getChannel('logError'), error);
                                });

                        }
                    }
                }
                return this;
            },
            /**
             *
             * @param {jQuery}  $panel
             * @param {Deferred} asyncTask
             * @returns {*}
             * @private
             */
            _layoutFilters: function ($panel, asyncTask) {
                var _this = this,
                    model = _this.getModel();
                if (this._hasFilters()) {
                    var $filterSection = $('<section>', {
                        'data-id': 'filters'
                    });
                    helpersModule.waitLoading($filterSection);

                    $panel.append($filterSection);
                    var html = [],
                        callbacks = [],
                        event = 'render_' + helpersModule.uniqueID(),
                        ROCollections = model.getFiltersROCollection(this, $filterSection),
                        length = ROCollections.length,
                        asyncTaskCompleted = 0;
                    $.subscribe(event,
                        /**
                         * @param {Event} e
                         * @param {FilterLayoutDTO} data
                         */
                            function (e, data) {
                            html[data.counter] = data.text;
                            if (data.callback) {
                                callbacks.push(data.callback);
                            }
                            asyncTaskCompleted += 1;
                            if (asyncTaskCompleted === length) {
                                $.unsubscribe(event);
                                $filterSection.addClass('section-filters');
                                $filterSection.html(
                                    _this.filterTemplate({
                                        html: '<div><ul class="filters-list">' + html.join('') + '</div></ul></div>',
                                        formID: helpersModule.uniqueID()
                                    })
                                );
                                callbacks.forEach(function (fn) {
                                    fn();
                                });
                                asyncTask.resolve();

                            }
                        });
                    ROCollections.each(function (item, i) {
                        item.render(event, i, ROCollections);
                    });

                } else {
                    asyncTask.resolve();
                }
                return this;

            },
            /**
             * @param {jQuery} $panel
             * @private
             */
            _layoutFormSection: function ($panel) {
                var model = this.getModel(),
                    $formSection;
                if (model.isDiscussionView()) {
                    if (this.getCard()) {
                        $formSection = $panel;
                    } else {
                        $formSection = $('<section>');
                        $panel.append($formSection);
                    }
                } else {
                    $formSection = $('<section>', {
                        'class': 'section-grid',
                        'data-id': 'grid-form'
                    });
                    $panel.append($formSection);
                }

                var view = model.makeView($formSection, this);
                view.render();
                this._persistReferenceToAbstractView(view);

            },
            /**
             * @description Persist reference to created AbstractView. To prevent leak memory.
             * @param {AbstractView} view
             * @private
             */
            _persistReferenceToAbstractView: function (view) {
                this.view = view;
            },
            /**
             * @description Persist reference to initialized settings dialog. To prevent leak memory.
             * @param {?jQuery} $settings
             * @private
             */
            _persistReferenceToRefreshDialogSettings: function ($settings) {
                this._$settings = $settings;
            },
            _refreshHandler: function (e) {
                var model = this.getModel();
                if (this.getView().hasChange()) {
                    if (this._$settings) {
                        this._$settings.dialog('open');
                    } else {

                        var $dialog = $('<div></div>', {
                            html: optionsModule.getMessage('refreshForm')
                        });
                        $dialog.dialog({
                            title: optionsModule.getMessage('projectName'),
                            dialogClass: 'wizard-dialog refresh-dialog',
                            resizable: false,
                            height: 140,
                            modal: true,
                            buttons: {
                                'Сохранить': function () {
                                    $(this).dialog('close');
                                    model.trigger('save:form', {
                                        refresh: true
                                    });
                                },
                                'Нет': function () {
                                    $(this).dialog('close');
                                    model.trigger('refresh:form', {});
                                },
                                'Отмена': function () {
                                    $(this).dialog('close');
                                }
                            },
                            create: function () {
                                $(this)
                                    .siblings('div')
                                    .find('button')
                                    .first()
                                    .addClass('wizard-next-button')
                                    .nextAll()
                                    .addClass('wizard-cancel-button');
                            }
                        });
                        this._persistReferenceToRefreshDialogSettings($dialog);
                    }

                } else {
                    model.trigger('refresh:form', {});
                }
                e.stopImmediatePropagation();

            },
            /**
             * @param {Event} e
             */
            _openChildForm: function (e) {
                var $editable = $(e.target),
                    options = $editable.data().editable.options,
                    view = options.view,
                    parentID = $editable.closest('tr').attr('data-id'),
                    toID = options.toID,
                    toName = options.toName,
                    fromID = options.fromID,
                    fromName = options.fromName,
                    isSelect = '';

                var model = this.getModel(),
                    hashKey = options.name + '_' + parentID;

                var form = model.getOpenedForm(hashKey);
                if(form){
                    form.setWindowActive();
                    return false;
                }
                if (toID && toName && fromName && fromID) {
                    //todo: support select view
                    isSelect = 1;
                }
                helpersModule.leaveFocus();

                var asyncTask = deferredModule.create();

                mediator.publish(optionsModule.getChannel('xmlRequest'), {
                    name: view,
                    type: optionsModule.getRequestType('deferred'),
                    id: deferredModule.save(asyncTask)
                });

                var _this = this;
                asyncTask
                    .done(function (response) {
                        var $xml = response.data;
                        var model = new FormModel({
                            $xml: $xml,
                            parentModel: _this.getModel(),
                            parentId: parentID,
                            columnName:  options.name
                        });
                        var view = new FormView({
                            model: model
                        });
                        model.addOpenedForm(hashKey, view);
                        view.render()
                    })
                    .fail(function (error) {
                        mediator.publish(optionsModule.getChannel('showError'), error);
                    });

                e.stopImmediatePropagation();

            },
            /**
             * @param {String} id
             * @param {String} name
             * @returns {jQuery}
             * @private
             */
            _addTab: function (id, name) {
                var tabsModule = facade.getTabsModule(),
                    $item = $('<li>', {
                        html: tabsModule.createTabLink(id, name)
                    }),
                    $tabs = helpersModule.getTabsObj();
                $tabs.children('ul').append($item);
                $tabs.tabs();
                $tabs.tabs('refresh');
                tabsModule.push($item);
                return $item;
            }
        })
})
(Backbone, jQuery, optionsModule, mediator, helpersModule);