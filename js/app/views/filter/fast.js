/**
 * Class FastFilterView
 * @class
 * @augments FilterView
 */
var FastFilterView = (function (Backbone, $, helpersModule, FilterView, deferredModule, optionsModule) {
    'use strict';
    return FilterView.extend(
        /** @lends FastFilterView */
        {
            template: _.template([
                '<% if (isNextRow) { %> </div><div class="filter-row"><% } %>',
                '<li class="fast-filter filter-item" id="<%= containerID %>" ',
                ' name="<%= attribute %>"',
                ' <% if (parentFilterKey) { %> rel="<%= parentFilterKey %>"  <% } %> >',
                '<input type="hidden" name="<%= attribute %>">',

                '<% if (!parentFilterKey || force) { %>',
                '<% if (isMultiSelect) { %>',
                '<% _.each(data, function(item) { %>',
                '<span class="checkbox inline">',
                '<input id="<%= item.id %>" value="<%= item.val %>" type="checkbox" name="<%= attribute %>[]">',
                '<label for="<%= item.id %>" ><%= item.name %></label>',
                '</span>',
                ' <% }); %>',
                '<% }else{ %>',
                '<% _.each(data, function(item) { %>',
                '<span class="radio inline">',
                '<input id="<%= item.id %>" value="<%= item.val %>|" type="radio" name="<%= attribute %>">',
                '<label for="<%= item.id %>"><%= item.name %></label>',
                '</span>',
                ' <% }); %>',
                '<% } %>',
                '<% } %>',
                '</li>'
            ].join('')),
            events: {},
            /**
             * @override
             */
            destroy: function () {
                delete this.template;
                this.undelegateEvents();
                this.$el.off();
                this.stopListening(this.model);
                FilterView.prototype.destroy.apply(this);
                this.unbind();
            },
            /**
             * @returns {string}
             */
            getValue: function () {
                return this.view.getFilterData()[this.model.get('key')];
            },
            /**
             * @returns {Deferred}
             */
            deferVisibleValue: function () {
                var defer = deferredModule.create(),
                    values = this.getValue().split('|');
                this.model.receiveData()
                    .done(function (res) {
                        var data = res.data;
                        var response = [];
                        values.forEach(function (item) {
                            if (item !== '') {
                                response.push(data[item].name);
                            }
                        });
                        defer.resolve({
                            value: response.join('/')
                        });
                    });
                return defer;
            },
            /**
             * @param event {String}
             * @param i {int}
             * @param collection {FiltersROCollection}
             */
            render: function (event, i, collection) {
                var _this = this,
                    model = this.model,
                    visibleDf = deferredModule.create(),
                    nextRowDf = deferredModule.create(),
                    multiSelectDf = deferredModule.create(),
                    multiSelectId = deferredModule.save(multiSelectDf),
                    visibleId = deferredModule.save(visibleDf),
                    nextRowId = deferredModule.save(nextRowDf);
                var changeHandler = model.getEventChange();
                var selector = 'input';
                this.$el.on('change', selector, function (e) {
                    var val = _this.getValue();
                    if (changeHandler) {
                        helpersModule.scriptExpressionEval(changeHandler, val, _this);
                    }
                    model.trigger('change:value', val);
                    e.stopImmediatePropagation();
                });

                model.isVisibleEval(visibleId);
                model.isNextRowEval(nextRowId);
                model.isMultiSelectEval(multiSelectId);
                var dataDf = model.receiveData(true);
                $.when(visibleDf, nextRowDf, multiSelectDf, dataDf).done(function (visible, nextRow, multiSelect, dataRes) {
                    var isVisible = visible.value,
                        isNextRow = nextRow.value,
                        data = dataRes.data,
                        isMultiSelect = multiSelect.value,
                        text = '';
                    var prepareData = [],
                        j,
                        hasOwnProperty = Object.prototype.hasOwnProperty;
                    for (j in data) {
                        if (hasOwnProperty.call(data, j)) {
                            prepareData.push({
                                id: helpersModule.uniqueID(),
                                val: data[j].id,
                                name: data[j].name
                            });
                        }
                    }
                    if (isVisible) {
                        text = _this.template({
                            attribute: model.getAttribute(),
                            isNextRow: isNextRow,
                            parentFilterKey: parentFilter,
                            isMultiSelect: isMultiSelect,
                            data: prepareData,
                            containerID: _this.id
                        });
                    }

                    var parentFilter = model.getProperties().get('parentFilter');
                    if (parentFilter) {
                        var parentModel = collection.findWhere({
                            key: parentFilter
                        });

                        _this.listenTo(parentModel, 'change:value', function (value) {
                                if (value) {
                                    var refreshDf = deferredModule.create(),
                                        refreshDeferId = deferredModule.save(refreshDf),
                                        defer = _this.model.readProcEval({'parentfilter.id': value});
                                    defer.done(function (data) {
                                        var sql = data.sql;
                                        mediator.publish(optionsModule.getChannel('socketRequest'), {
                                            query: sql,
                                            type: optionsModule.getRequestType('deferred'),
                                            id: refreshDeferId
                                        });
                                    });
                                    $.when(refreshDf).done(function (res) {
                                        var data = res.data;
                                        var prepareData2 = [],
                                            j,
                                            hasOwnProperty = Object.prototype.hasOwnProperty;
                                        for (j in data) {
                                            if (hasOwnProperty.call(data, j)) {
                                                prepareData2.push({
                                                    id: helpersModule.uniqueID(),
                                                    val: data[j].id,
                                                    name: data[j].name
                                                });
                                            }
                                        }
                                        if (isVisible) {
                                            text = _this.template({
                                                attribute: model.getAttribute(),
                                                isNextRow: isNextRow,
                                                parentFilterKey: parentFilter,
                                                isMultiSelect: isMultiSelect,
                                                data: prepareData2,
                                                containerID: _this.id,
                                                force: true
                                            });
                                            $('#' + _this.id).replaceWith(text);
                                        }
                                    });
                                }
                            }
                        );
                    }
                    $.publish(event, {
                        text: text,
                        counter: i
                    });
                });

            }
        });
})(Backbone, jQuery, helpersModule, FilterView, deferredModule, optionsModule);