/**
 * Class FormView
 * @class
 */
var FormView = (function (Backbone, $, optionsModule, mediator, helpersModule) {
    'use strict';
    return Backbone.View.extend(
        /** @lends FormView */
        {
            /**
             * @param options
             * @private
             */
            initialize: function (options) {
                _.bindAll(this, 'render');
                if (options.$card) {
                    this.$card = options.$card;
                }
                this.model = options.model;
                if (options.card) {
                    this.card = options.card;
                } else {
                    this.card = null;
                }
                this.$el = this.createPanel();
            },
            events: {
                'click .grid-button .editable': 'openChildForm',
                'click .menu-button-refresh': function (e) {
                    var _this = this;
                    if (this.view.hasChange()) {
                        var $dialog = $('<div>' + optionsModule.getMessage('refreshForm') + '</div>');
                        $dialog.dialog({
                            title: optionsModule.getMessage('projectName'),
                            dialogClass: 'wizard-dialog refresh-dialog',
                            resizable: false,
                            height: 140,
                            modal: true,
                            buttons: {
                                'Да': function () {
                                    $(this).dialog("close");
                                    _this.model.trigger('save:form', {
                                        refresh: true
                                    });
                                },
                                'Нет': function () {
                                    $(this).dialog("close");
                                    _this.model.trigger('refresh:form', {});
                                },
                                'Отмена': function () {
                                    $(this).dialog("close");
                                }
                            },
                            create: function () {
                                var $buttons = $(this).siblings('div').find("button");
                                $buttons.first()
                                    .addClass("wizard-next-button")
                                    .nextAll()
                                    .addClass('wizard-cancel-button');
                            }
                        });
                    } else {
                        _this.model.trigger('refresh:form', {});
                    }
                    e.stopImmediatePropagation();

                },
                'keydown input.filter': function (e) {
                    if (e.keyCode === optionsModule.getKeyCode('enter')) {
                        this.model.trigger('refresh:form', {});
                    }
                },
                'click .fm-email-send': function (e) {
                    this.model.trigger('openMailClient');
                    e.preventDefault();
                },
                'click .fm-wizard-task': function (e) {
                    this.model.trigger('openWizardTask', e);
                    e.preventDefault();
                }
            },
            view: null,
            _panelID: null,
            $closeLink: null,
            headerTemplate: _.template([
                '<section class="section-header" data-id="header">',
                '<div class="top-header">',
                '<div class="left-header">',
                '<%= image %>',
                '</div>',
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
            /**
             * @method destroy
             */
            destroy: function () {
                this.destroyCloseEventListener();
                this.undelegateEvents();
                this._panelID = null;
                this.$closeLink = null;
                this.headerTemplate = null;
                this.filterTemplate = null;
                this.$card = null;
                if (this.card) {
                    this.card.destroy();
                    this.card = null;
                }
                this.model.destroy();
                this.model = null;
                if (this.view) {
                    this.view.destroy();
                    this.view = null;
                }
                delete this.$el; // Delete the jQuery wrapped object variable
                delete this.el; // Delete the variable reference to this node
                this.events = null;
            },
            /**
             * @param e {Event}
             */
            openChildForm: function (e) {
                var $editable = $(e.target),
                    options = $editable.data().editable.options,
                    view = options.view,
                    parentID = $editable.closest('tr').attr('data-id'),
                    toID = options.toID,
                    toName = options.toName,
                    fromID = options.fromID,
                    fromName = options.fromName,
                    isSelect = '';
                if (toID && toName && fromName && fromID) {
                    //todo: support select view
                    isSelect = 1;
                }
                helpersModule.leaveFocus();
                mediator.publish(optionsModule.getChannel('openForm'), {
                    view: view,
                    parentModel: this.model,
                    parentID: parentID
                });
                e.stopImmediatePropagation();

            },
            /**
             * @method render
             */
            render: function () {
                var $panel = this.$el,
                    _this = this,
                    panelDefer = $.Deferred();
                if (this.model.isAttachmentView()) {
                    var $section = $('<section>', {
                        'class': 'attachment-grid',
                        id: helpersModule.uniqueID()
                    });
                    $panel.append($section);
                    $panel = $section;
                }
                this.layoutHeader($panel);
                this.layoutFilters($panel, panelDefer);
                $.when(panelDefer).done(function () {
                    _this.layoutFormSection($panel);

                    if (!_this.model.isMapView()) {
                        setTimeout(function () {
                            mediator.publish(optionsModule.getChannel('reflowTab'), true);
                        }, 17);
                    }

                });
            },
            /**
             * @returns {Array|Object}
             */
            getFilterData: function () {
                //todo: support idlist
                if (this.model.hasFilters()) {
                    var rawData = this.$el.find('.filter-form').serializeArray(),
                        value,
                        name,
                        separator,
                        result = [];
                    rawData.forEach(function (item) {
                        value = item.value;
                        name = item.name;
                        if (value) {
                            if (name.slice(-2) === '[]') {
                                separator = '|';
                                name = name.slice(0, name.length - 2);
                            } else {
                                separator = '';
                            }

                            if (result.hasOwnProperty(name)) {
                                result[name] += value + separator;
                            } else {
                                result[name] = value + separator;
                            }
                        }
                    });
                    return result;
                    //        if (value != '') {
                    //            if (_this.$form.find('[name="' + name + '"]').closest('li').attr('data-format') == 'idlist') {
                    //                // Convert "18 19     22" to "18|20|"
                    //                var numericArray = value.split(' ');
                    //                numericArray = numericArray.filter(function (val) {
                    //                    return val !== '';
                    //                });
                    //                result[name] = numericArray.join('|') + '|';
                    //            } else {
                    //                result[name] = value;
                    //            }
                    //        }

                } else {
                    return {};
                }
            },
            /**
             * @returns {String}
             */
            getPanelID: function () {
                if (this._panelID === null) {
                    this._panelID = helpersModule.uniqueID();
                }
                return this._panelID;
            },
            /**
             * @param id {String}
             * @param name {String}
             * @returns {jQuery}
             */
            addTab: function (id, name) {
                var tabsModule = facade.getTabsModule();
                var $item = $('<li>', {
                        html: tabsModule.createTabLink(id, name)
                    }),
                    $tabs = helpersModule.getTabsObj();
                $tabs.children('ul').append($item);
                $tabs.tabs();
                $tabs.tabs('refresh');
                tabsModule.push($item);
                return $item;
            },
            /**
             * @param id {String}
             * @param name {String}
             * @returns {jQuery}
             */
            addTabAndSetActive: function (id, name) {
                var $item = this.addTab(id, name);
                helpersModule.getTabsObj().tabs({active: $item.index()});
                return $item;
            },
            /**
             * @returns {jQuery}
             */
            createPanel: function () {
                if (this.$card) {
                    return this.$card;
                }
                var id = this.getPanelID(),
                    $panel = $('<div>', {
                        id: id
                    });
                $('#tabs').append($panel);
                var $closeLink = this.addTabAndSetActive(id, this.model.getCaption());
                this.addCloseEventListener($closeLink);
                return $panel;

            },
            /**
             * @param $closeLink {jQuery}
             */
            addCloseEventListener: function ($closeLink) {
                this.$closeLink = $closeLink;
                var _this = this;
                this.$closeLink
                    .on('click', '.tab-closed', function () {
                        _this.destroy();
                        facade.getTabsModule().close($(this));
                        return false;
                    })
                    .on('touchmove', function () {
                        _this.destroy();
                        facade.getTabsModule().close($(this));
                    });
            },
            /**
             * @method destroy
             */
            destroyCloseEventListener: function () {
                if (this.$closeLink) {
                    this.$closeLink.off('click');
                }
            },
            /**
             * @param $panel {jQuery}
             */
            layoutHeader: function ($panel) {
                var title;
                if (this.model.isAttachmentView()) {
                    title = this.model.isNotSaved() ?
                        '<b>Сохраните строку, перед добавлением вложения</b>' :
                        [
                            '<b>Прикрепить файл</b> можно простым способом:',
                            '<li><b>Перенести файл мышкой</b> в область этой страницы</li>',
                            '<li><b>Нажать</b> кнопку <b>сохранить</b></li>'
                        ].join('');
                    $panel.append(this.headerTemplate({
                        image: '<span class="fa-paperclip"></span>',
                        'title': title,
                        'asyncId': null
                    }));
                } else {
                    if (this.model.hasHeader()) {
                        var asyncId = helpersModule.uniqueID(),
                            model = this.model,
                            image = facade.getImageAdapter().convert(model.getImage());
                        title = model.getHeaderText();
                        $panel.append(this.headerTemplate({
                            image: image,
                            title: title,
                            asyncId: asyncId
                        }));
                        var stateProcedure = model.getStateProc();
                        if (stateProcedure) {
                            mediator.publish(optionsModule.getChannel('socketRequest'), {
                                query: stateProcedure,
                                type: optionsModule.getRequestType('jquery'),
                                id: asyncId
                            });
                        }
                    }
                }

            },
            /**
             *
             * @param $panel {jQuery}
             * @param panelDefer {Deferred}
             */
            layoutFilters: function ($panel, panelDefer) {
                var _this = this;
                if (this.model.hasFilters()) {
                    var $filterSection = $('<section>', {
                        'class': 'section-filters',
                        'data-id': 'filters'
                    });
                    $panel.append($filterSection);
                    var html = [],
                        callbacks = [],
                        event = 'render_' + helpersModule.uniqueID(),
                        ROCollections = this.model.getFiltersROCollection(this, $filterSection),
                        length = ROCollections.length,
                        asyncTaskCompleted = 0;
                    $.subscribe(event, function (e, data) {
                        html[data.counter] = data.text;
                        if (data.callback) {
                            callbacks.push(data.callback);
                        }
                        asyncTaskCompleted += 1;
                        if (asyncTaskCompleted === length) {
                            $.unsubscribe(event);
                            $filterSection.append(
                                _this.filterTemplate({
                                    html: '<div><ul class="filters-list">' + html.join('') + '</div></ul></div>',
                                    formID: helpersModule.uniqueID()
                                })
                            );
                            callbacks.forEach(function (fn) {
                                fn();
                            });
                            panelDefer.resolve();

                        }
                    });
                    ROCollections.each(function (item, i) {
                        item.render(event, i, ROCollections);
                    });

                } else {
                    panelDefer.resolve();
                }

            },
            /**
             * @param $panel {jQuery}
             */
            layoutFormSection: function ($panel) {
                var $formSection;
                if (this.model.isDiscussionView()) {
                    if (this.card) {
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

                var ViewClass = this.model.getFormView(),
                    view = new ViewClass({
                        $el: $formSection,
                        model: this.model,
                        view: this
                    });
                this.view = view;

            }
        });
})(Backbone, jQuery, optionsModule, mediator, helpersModule);