var FormView = (function (Backbone, $, optionsModule, mediator, helpersModule) {
    'use strict';
    return AbstractView.extend({
        dataParentId: null,
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
            '<%= html %>',
            '</div>'
        ].join('')),
        events: {
            'click .grid-button .editable': 'openChildForm'
        },
        openChildForm: function (e) {
            var main = chApp.namespace('main'),
                $editable = $(e.target);
            var options = $editable.data().editable.options,
                view = options.view,
                column = facade.getFactoryModule().makeChGridColumnBody($editable),
                form = column.getChForm(),
                parentID = column.getID(),
                isNew = !$.isNumeric(parentID),
                parentView = form.getView(),
                tabID = ChGridColumn.createChildGridTabID(parentID, view, parentView),
                $tabs = main.$tabs,
                $currentTab = $tabs.find("[aria-controls='" + tabID + "']"),
                toID = options.toID,
                toName = options.toName,
                fromID = options.fromID,
                fromName = options.fromName,
                isSelect = '';
            if (toID && toName && fromName && fromID) {
                isSelect = 1;
            }
            Chocolate.leaveFocus();
            mediator.publish(optionsModule.getChannel('openForm'), {
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
                setTimeout(function () {
                    _this.layoutFormSection($panel);
                    if (!_this.model.isMapView()) {
                        mediator.publish(optionsModule.getChannel('reflowTab'));
                    }
                }, 17);

            });
        },
        createPanel: function () {
            var id = helpersModule.uniqueID(),
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
                        image = facade.getImageAdapter().convert(this.model.getImage());
                    title = this.model.getHeaderText();

                    $panel.append(this.headerTemplate({
                        'image': image,
                        'title': title,
                        'asyncId': asyncId
                    }));
                    var stateProcedure = this.model.getStateProc();
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
                    ROCollections = this.model.getFiltersROCollection(),
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
                                html: '<div><ul class="filters-list">' + html.join('') + '</div></ul></div>'
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
                $formSection = $('<section>');
            } else {
                $formSection = $('<section>', {
                    'class': 'section-grid',
                    'data-id': 'grid-form'
                });
            }

            $panel.append($formSection);
            var ViewClass = this.model.getFormView(),
                view = new ViewClass({
                    $el: $formSection,
                    model: this.model,
                    dataParentId: this.dataParentId
                });

        }
    });
})(Backbone, jQuery, optionsModule, mediator, helpersModule);