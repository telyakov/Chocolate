/**
 * Class CheckBoxView
 * @class
 * @augments FilterView
 */
var CheckBoxView = (function (Backbone, $, helpersModule, FilterView) {
    'use strict';
    return FilterView.extend(
        /** @lends CheckBoxView */
        {
            template: _.template([
                '<% if (isNextRow) { %> </div><div class="filter-row"><% } %>',
                '<li class="filter-item" id="<%= containerID %>">',
                '<div class="checkbox-filter" title="<%= tooltip %>">',
                '<label for="<%= id %>"><%= caption %></label>',
                '<input id="<%= id %>" name="<%= attribute %>" type="checkbox"/>',
                '</div>',
                '</li>'
            ].join('')),
            /**
             * @abstract
             * @class CheckBoxView
             * @augments FilterView
             * @constructs
             */
            initialize: function (options) {
                this._$filter = null;
                FilterView.prototype.initialize.call(this, options);
            },
            /**
             * @override
             */
            destroy: function () {
                delete this.template;
                if (this._$filter) {
                    this._$filter.bootstrapSwitch('destroy');
                    delete this._$filter;
                }
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
                    model.runAsyncTaskIsNextRow()
                )
                    .done(function (isVisibleResponse, isEnabledResponse, isNextRowResponse) {
                        _this._renderDone(isVisibleResponse, isEnabledResponse, isNextRowResponse, event, i);
                    })
                    .fail(function (error) {
                        _this._handleError(error, event, i);
                    });
            },
            /**
             *
             * @param {string} error
             * @param {string} event
             * @param {Number} i
             * @private
             */
            _handleError: function (error, event, i) {
                $.publish(event, {
                    text: '',
                    counter: i,
                    callback: function () {
                    }
                });
                this.publishError({
                    error: error,
                    view: this
                })
            },
            /**
             * @param $filter {jQuery}
             * @private
             */
            _persistLinkToJqueryFilter: function ($filter) {
                this._$filter = $filter;
            },
            /**
             *
             * @param {BooleanResponse} isVisibleResponse
             * @param {BooleanResponse} isEnabledResponse
             * @param {BooleanResponse} isNextRowResponse
             * @param {string} event
             * @param {Number} i
             * @private
             */
            _renderDone: function (isVisibleResponse, isEnabledResponse, isNextRowResponse, event, i) {
                var isDisabled = !isEnabledResponse.value,
                    isVisible = isVisibleResponse.value,
                    isNextRow = isNextRowResponse.value,
                    filterID = helpersModule.uniqueID(),
                    html = this._getFilterHtml(isVisible, isDisabled, isNextRow, filterID);
                $.publish(event, {
                    text: html,
                    counter: i,
                    callback: this._createCallback(filterID)
                });
            },
            /**
             *
             * @param {String} filterID
             * @returns function
             * @private
             */
            _createCallback: function (filterID) {
                var _this = this;
                return function () {
                    var $filter = $('#' + filterID);
                    _this._persistLinkToJqueryFilter($filter);
                    $filter.bootstrapSwitch({
                        size: 'small',
                        onText: 'Да',
                        offText: 'Нет',
                        onSwitchChange: function (event, state) {
                            if (state) {
                                $filter.val(1);
                            }
                        }
                    });
                }
            },
            /**
             *
             * @param {Boolean} isVisible
             * @param {Boolean} isDisabled
             * @param {Boolean} isNextRow
             * @param {string} filterID
             * @returns {string}
             * @private
             */
            _getFilterHtml: function (isVisible, isDisabled, isNextRow, filterID) {
                if (isVisible) {
                    var model = this.getModel();
                    return this.template({
                        id: filterID,
                        caption: model.getCaption(),
                        attribute: model.getAttribute(),
                        tooltip: model.getTooltip(),
                        disabled: isDisabled,
                        isNextRow: isNextRow,
                        containerID: this.id
                    });
                }
                return '';
            }
        });
})(Backbone, jQuery, helpersModule, FilterView);