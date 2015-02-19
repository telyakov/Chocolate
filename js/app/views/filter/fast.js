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
                    _this = this;

                this.getModel()
                    .startAsyncTaskGetData()
                    .done(
                    /** @param {DeferredResponse} res */
                        function (res) {
                        _this._getCurrentValueDone(res, asyncTask);
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
             * @param {String} event
             * @param {Number} i
             * @param {FiltersROCollection} collection
             */
            render: function (event, i, collection) {
                var _this = this,
                    model = this.getModel();

                $.when(
                    model.runAsyncTaskIsVisible(),
                    model.runAsyncTaskIsNextRow(),
                    model.runAsyncTaskIsMultiSelect(),
                    model.startAsyncTaskGetData(true)
                ).done(function (isVisibleResponse, isNextRowResponse, isMultiSelectResponse, dataResponse) {
                        _this._renderDone(
                            isVisibleResponse,
                            isNextRowResponse,
                            isMultiSelectResponse,
                            dataResponse,
                            event,
                            i,
                            collection
                        );
                    })
                    .fail(function (error) {
                        _this.handleError(error, event, i);
                    });
            },
            /**
             * @param {DeferredResponse} res
             * @param {Deferred} asyncTask
             * @private
             */
            _getCurrentValueDone: function (res, asyncTask) {
                var data = res.data,
                    response = [],
                    values = this.getValue().split('|');
                values.forEach(function (item) {
                    if (item !== '') {
                        response.push(data[item].name);
                    }
                });
                asyncTask.resolve({
                    value: response.join('/')
                });
            },
            /**
             *
             * @param {Boolean} isVisible
             * @param {Boolean} isMultiSelect
             * @param {Boolean} isNextRow
             * @param {Object} rawData
             * @returns {string}
             * @private
             */
            _getFilterHtml: function (isVisible, isMultiSelect, isNextRow, rawData) {
                if (isVisible) {
                    var model = this.getModel();
                    return this.template({
                        attribute: model.getAttribute(),
                        isNextRow: isNextRow,
                        isMultiSelect: isMultiSelect,
                        data: this._prepareData(rawData),
                        containerID: this.id
                    });
                }
                return '';
            },
            /**
             *
             * @param {Event} e
             * @param {Boolean} isMultiSelect
             * @fire GridForm#refresh:model
             * @private
             */
            _changeHandler: function (e, isMultiSelect) {
                var currentValue = $(e.target).val(),
                    model = this.getModel(),
                    newVal = currentValue;
                if (isMultiSelect) {
                    var prevValue = model.get('value');
                    if (prevValue === null) {
                        prevValue = '';
                    }
                    newVal = prevValue + currentValue + '|';
                }
                model.set('value', newVal);
                var eventChange = model.getEventChange();
                if (eventChange) {
                    interpreterModule.runAsyncParseScript(eventChange, this);
                }
                model.trigger('refresh:model', newVal);
            },
            /**
             *
             * @param {String} value
             * @param {Boolean} isNextRow
             * @param {Boolean} isMultiSelect
             * @private
             */
            _refreshModelHandler: function (value, isNextRow, isMultiSelect) {
                if (value) {
                    var $elem = $('#' + this.id),
                        model = this.getModel(),
                        _this = this;
                    helpersModule.waitLoading($elem);

                    var asyncTask = deferredModule.create();
                    model
                        .runAsyncTaskGetReadProc({'parentfilter.id': value})
                        .done(
                        /** @param {SqlBindingResponse} data */
                            function (data) {
                            mediator.publish(optionsModule.getChannel('socketRequest'), {
                                query: data.sql,
                                type: optionsModule.getRequestType('deferred'),
                                id: deferredModule.save(asyncTask)
                            });
                        })
                        .fail(function (error) {
                            _this.publishError({
                                error: error,
                                view: this
                            });
                        });

                    asyncTask
                        .done(
                        /** @param {DeferredResponse} res */
                            function (res) {
                            var html = _this._getFilterHtml(true, isMultiSelect, isNextRow, res.data);
                            $elem.replaceWith(html);
                        })
                        .fail(function (error) {
                            _this.publishError({
                                error: error,
                                view: this
                            });
                        });
                }
            },
            /**
             *
             * @param {BooleanResponse} isVisibleResponse
             * @param {BooleanResponse} isNextRowResponse
             * @param {BooleanResponse} isMultiSelectResponse
             * @param {DeferredResponse} dataResponse
             * @param {string} event
             * @param {Number} i
             * @param {FiltersROCollection} collection
             * @private
             */
            _renderDone: function (isVisibleResponse, isNextRowResponse, isMultiSelectResponse, dataResponse, event, i, collection) {
                var isVisible = isVisibleResponse.value,
                    isNextRow = isNextRowResponse.value,
                    data = dataResponse.data,
                    isMultiSelect = isMultiSelectResponse.value,
                    text = this._getFilterHtml(isVisible, isMultiSelect, isNextRow, data),
                    _this = this,
                    model = this.getModel();
                if (isVisible) {
                    var selector = '#' + this.id + ' input';
                    this.$el.on('change', selector, function (e) {
                        _this._changeHandler(e, isMultiSelect);
                    });


                    var parentFilterKey = model.getProperties().get('parentFilter');
                    if (parentFilterKey) {
                        /**
                         * @type {FilterRO}
                         */
                        var parentModel = collection.findWhere({
                            key: parentFilterKey
                        });
                        this.listenTo(parentModel, 'refresh:model', function (value) {
                            this._refreshModelHandler(value, isNextRow, isMultiSelect)
                        });
                    }
                }
                $.publish(event, {
                    text: text,
                    counter: i
                });
            },
            /**
             *
             * @param {Object} rawData
             * @returns {Array}
             * @private
             */
            _prepareData: function (rawData) {
                var result = [],
                    j,
                    hasOwnProperty = Object.prototype.hasOwnProperty;
                for (j in rawData) {
                    if (hasOwnProperty.call(rawData, j)) {
                        result.push({
                            id: helpersModule.uniqueID(),
                            val: rawData[j].id,
                            name: rawData[j].name
                        });
                    }
                }
                return result;
            }
        });
})(Backbone, jQuery, helpersModule, FilterView, deferredModule, optionsModule);