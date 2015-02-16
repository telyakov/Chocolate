var TreeFilterView = (function (undefined, Backbone, $, helpersModule, FilterView, deferredModule, optionsModule) {
    'use strict';
    return FilterView.extend(
        /** @lends TreeFilterView */
        {
            template: _.template([
                '<% if (isNextRow) { %> </div><div class="filter-row"><% } %>',
                '<li class="filter-item" id="<%= containerID %>">',
                '<% if (disabled) { %> <div class="filter-mock-no-edit"></div>  <% } %>',
                '<div class="tree-container" title="<%= tooltip %>">',
                '<label for="<%= id %>"><%= caption %></label>',
                '<select <% if (disabled) { %> disabled  <% } %> >',
                '</select>',
                '<input <% if (disabled) { %> disabled  <% } %> class="tree-button" id="<%= buttonId %>" title="Кликните, чтобы выбрать фильтр" type="button">',
                '<input name="<%= attribute %>" id="<%= id %>" type="hidden">',
                '</div>',
                '</li>'
            ].join('')),
            /**
             *
             * @class TreeFilterView
             * @param {Object} opts
             * @augments FilterView
             * @constructs
             */
            initialize: function (opts) {
                this._dynatreeModel = null;
                FilterView.prototype.initialize.call(this, opts);
            },
            /**
             * @override
             */
            destroy: function () {
                delete this.template;
                if (this._dynatreeModel) {
                    this._dynatreeModel.destroy();
                    this._dynatreeModel = null;
                }
                this.$el.off();
                FilterView.prototype.destroy.apply(this);
            },
            /**
             * @param {string} event
             * @param {number} i
             * @override
             */
            render: function (event, i) {
                var _this = this,
                    model = this.getModel();

                $.when(
                    model.runAsyncTaskIsVisible(),
                    model.runAsyncTaskIsEnabled(),
                    model.runAsyncTaskIsNextRow(),
                    model.runAsyncTaskIsMultiSelect(),
                    model.runAsyncTaskGetReadProc()
                )
                    .done(function (isVisibleResponse, isEnabledResponse, isNextRowResponse, isMultiSelectResponse, isReadProcResponse) {
                        _this._renderDone(
                            isVisibleResponse,
                            isEnabledResponse,
                            isNextRowResponse,
                            isMultiSelectResponse,
                            isReadProcResponse,
                            event,
                            i
                        );
                    })
                    .fail(function (error) {
                        _this.handleError(error, event, i);
                    });
            },
            /**
             *
             * @param {Boolean} isVisible
             * @param {Boolean} isDisabled
             * @param {Boolean} isNextRow
             * @param {string} buttonId
             * @returns {string}
             * @private
             */
            _getFilterHtml: function (isVisible, isDisabled, isNextRow, buttonId) {
                if (isVisible) {
                    var model = this.getModel();
                    return this.template({
                        isNextRow: isNextRow,
                        disabled: isDisabled,
                        containerID: this.id,
                        tooltip: model.getTooltip(),
                        id: helpersModule.uniqueID(),
                        caption: model.getCaption(),
                        attribute: model.getAttribute(),
                        buttonId: buttonId
                    });
                }
                return '';
            },
            _onQuerySelect: function (flag, node) {
                if (node.childList === null) {
                    return true;
                } else {
                    for (var i in node.childList) {
                        if (node.childList.hasOwnProperty(i)) {
                            node.childList[i].select(flag);
                        }
                    }
                }
                return true;
            },
            /**
             *
             * @param {BooleanResponse} isVisibleResponse
             * @param {BooleanResponse} isEnabledResponse
             * @param {BooleanResponse} isNextRowResponse
             * @param {BooleanResponse} isMultiSelectResponse
             * @param {SqlBindingResponse} isReadProcResponse
             * @param {string} event
             * @param {Number} i
             * @private
             */
            _renderDone: function (isVisibleResponse, isEnabledResponse, isNextRowResponse, isMultiSelectResponse, isReadProcResponse, event, i) {
                var model = this.getModel(),
                    isDisabled = !isEnabledResponse.value,
                    isVisible = isVisibleResponse.value,
                    isNextRow = isNextRowResponse.value,
                    isMultiSelect = isMultiSelectResponse.value,
                    buttonId = helpersModule.uniqueID(),
                    text = this._getFilterHtml(isVisible, isDisabled, isNextRow, buttonId);
                if (isVisible) {
                    var filterProperties = model.getProperties(),
                        opts = {
                            debugLevel: 0,
                            checkbox: true,
                            selectMode: this._getSelectMode(isMultiSelect),
                            onQuerySelect: this._onQuerySelect,
                            children: [],
                            sql: isReadProcResponse.sql,
                            expandNodes: filterProperties.get('expandNodes'),
                            selectAll: filterProperties.get('selectAllNodes'),
                            restoreState: filterProperties.get('restoreState'),
                            separator: filterProperties.get('delimiter'),
                            rootID: filterProperties.get('rootID'),
                            title: model.getCaption(),
                            columnTitle: filterProperties.get('columnTitle'),
                            columnID: filterProperties.get('columnID'),
                            columnParentID: filterProperties.get('columnParentID'),
                            infoPanel: true,
                            getInput: function () {
                                return this.parent().children('input[type=hidden]');
                            }
                        },
                        selector = '#' + buttonId,
                        _this = this;
                    this.$el.on('click', selector, function (e) {
                        _this._showTreeDialog($(e.target), opts);
                    });
                }
                $.publish(event, {
                    text: text,
                    counter: i
                });
            },
            /**
             *
             * @param {jQuery} $el
             * @param {Object} opts
             * @returns {DynatreeModel}
             * @private
             */
            _makeDynatreeModel: function ($el, opts) {
                if (!this._dynatreeModel) {
                    this._dynatreeModel = new DynatreeModel({
                        $el: $el,
                        options: opts
                    });
                }
                return this._dynatreeModel;
            },
            /**
             *
             * @param {jQuery} $el
             * @param {Object} opts
             * @returns {boolean}
             * @private
             */
            _showTreeDialog: function ($el, opts) {
                var model = this._makeDynatreeModel($el, opts);
                if (model.isAlreadyInit()) {
                    model.loadFromCache();
                } else {
                    var _this = this,
                        asyncTask = deferredModule.create();
                    mediator.publish(optionsModule.getChannel('socketRequest'), {
                        query: model.getSql(),
                        id: deferredModule.save(asyncTask),
                        type: optionsModule.getRequestType('deferred')
                    });
                    asyncTask
                        .done(
                        /** @param {DeferredResponse} res */
                            function (res) {
                            model.generateContent(res.data);
                        })
                        .fail(function (error) {
                            _this.publishError({
                                view: this,
                                error: error
                            });
                        })
                }
                return false;
            },
            /**
             * @param {Boolean} isMultiSelect
             * @returns {number}
             * @private
             */
            _getSelectMode: function (isMultiSelect) {
                return (isMultiSelect) ? 2 : 1;
            }
        });
})(undefined, Backbone, jQuery, helpersModule, FilterView, deferredModule, optionsModule);