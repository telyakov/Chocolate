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
                '<input type="hidden" name="<%= attribute %>">',
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
                '</li>'
            ].join('')),
            /**
             * @override
             */
            destroy: function () {
                delete this.template;
                this.undelegateEvents();
                this.$el.off();
                this.stopListening(this.model);
                FilterView.prototype.destroy.apply(this);
            },
            /**
             * @override
             * @returns {Deferred}
             */
            runAsyncTaskGetCurrentValue: function () {
                //used in tasksForTops.xml
                var asyncTask = deferredModule.create(),
                    _this = this,
                    values = this.getValue().split('|');
                this.getModel()
                    .startAsyncTaskGetData()
                    .done(
                    /** @param {DeferredResponse} res */
                        function (res) {
                        var data = res.data,
                            response = [];
                        values.forEach(function (item) {
                            if (item !== '') {
                                response.push(data[item].name);
                            }
                        });
                        asyncTask.resolve({
                            value: response.join('/')
                        });
                    })
                    .fail(function (error) {
                        _this.publishError({
                            view: this,
                            error: error
                        });
                        asyncTask.reject(error);
                    });
                return asyncTask;
            },
            /**
             * @param event {String}
             * @param i {int}
             * @param collection {FiltersROCollection}
             */
            render: function (event, i, collection) {
                var _this = this,
                    model = this.getModel();

                $.when(
                    model.runAsyncTaskIsVisible(),
                    model.runAsyncTaskIsNextRow(),
                    model.runAsyncTaskIsMultiSelect(),
                    model.startAsyncTaskGetData(true)
                )
                    .done(function (visible, nextRow, multiSelect, dataRes) {
                        var isVisible = visible.value,
                            isNextRow = nextRow.value,
                            data = dataRes.data,
                            isMultiSelect = multiSelect.value,
                            text = '',
                            prepareData = [],
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
                                isMultiSelect: isMultiSelect,
                                data: prepareData,
                                containerID: _this.id
                            });
                            var selector = '#' + _this.id + ' input';
                            _this.$el.on('change', selector, function (e) {
                                var val = $(e.target).val(),
                                    newVal;
                                if (isMultiSelect) {

                                    var prevValue = model.get('value');
                                    if (prevValue === null) {
                                        prevValue = '';
                                    }
                                    newVal = prevValue + val + '|';
                                } else {
                                    newVal = val;
                                }
                                model.set('value', newVal);
                                var changeHandler = model.getEventChange();
                                if (changeHandler) {
                                    helpersModule.scriptExpressionEval(changeHandler, newVal, _this);
                                }
                                model.trigger('refresh:model', newVal);
                            });
                        }

                        var parentFilter = model.getProperties().get('parentFilter');
                        if (parentFilter) {
                            var parentModel = collection.findWhere({
                                key: parentFilter
                            });

                            _this.listenTo(parentModel, 'refresh:model', function (value) {
                                    var $elem = $('#' + _this.id);
                                    helpersModule.waitLoading($elem);
                                    if (value) {
                                        var refreshDf = deferredModule.create(),
                                            refreshDeferId = deferredModule.save(refreshDf),
                                            defer = model.runAsyncTaskGetReadProc({'parentfilter.id': value});
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
                                                $elem.replaceWith(text);
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