var FormView = (function (Backbone, $, optionsModule, mediator, helpersModule) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.$el = options.$el;
            this.model = options.model;
            if (options.card) {
                this.card = options.card;
            } else {
                this.card = null;
            }

            this.render();
        },
        events: {
            'click .grid-button .editable': 'openChildForm',
            'click .menu-button-refresh': function (e) {
                var _this = this;
                if (this.hasChange()) {
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
                                    isRefresh: true
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
                                .nextAll().
                                addClass('wizard-cancel-button');
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
            }
        },

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
        openChildForm: function (e) {
            var $editable = $(e.target),
                options = $editable.data().editable.options,
                view = options.view,
                parentID = $editable.closest('tr').attr('data-id'),
                $tabs = $('#tabs'),
                toID = options.toID,
                toName = options.toName,
                fromID = options.fromID,
                fromName = options.fromName,
                isSelect = '';
            if (toID && toName && fromName && fromID) {
                isSelect = 1;
            }
            helpersModule.leaveFocus();
            mediator.publish(optionsModule.getChannel('openForm'), {
                $el: $tabs,
                view: view,
                parentModel: this.model,
                parentID: parentID
            });
            e.stopImmediatePropagation();

        },

        render: function () {
            var $panel = this.createPanel(),
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
        _panelID: null,
        getPanelID: function () {
            if (this._panelID === null) {
                this._panelID = helpersModule.uniqueID();
            }
            return this._panelID;
        },
        createPanel: function () {
            if (this.card) {
                return this.$el;
            }
            var id = this.getPanelID(),
                $panel = $('<div>', {
                    id: id
                });
            this.$el.append($panel);
            facade.getTabsModule().addAndSetActive(id, this.model.getCaption());
            this.delegateEvents();
            return $panel;

        },
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
                    if (title.indexOf('fm-email-send') !== -1) {
                        this.events['click #' + this.getPanelID() + ' .fm-email-send'] = function () {
                            model.trigger('openMailClient');
                        };
                        this.delegateEvents();
                    }
                    if (title.indexOf('fm-wizard-task') !== -1) {

                        this.events['click #' + this.getPanelID() + ' .fm-wizard-task'] = function (e) {
                            e.preventDefault();
                            model.trigger('openWizardTask', e);
                        };
                        this.delegateEvents();
                    }
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
                    ROCollections = this.model.getFiltersROCollection(this),
                    length = ROCollections.length,
                    asyncTaskCompleted = 0;
                $.subscribe(event, function (e, data) {
                    html[data.counter] = data.text;
                    if (data.callback) {
                        callbacks.push(data.callback);
                    }
                    asyncTaskCompleted++;
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

        }
    });
})(Backbone, jQuery, optionsModule, mediator, helpersModule);