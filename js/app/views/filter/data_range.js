var DateRangeView = (function (Backbone, $, helpersModule, optionsModule, FilterView) {
    'use strict';
    return FilterView.extend(
        /** @lends DateRangeView */
        {
            template: _.template([
                '<% if (isNextRow) { %> </div><div class="filter-row"><% } %>',
                '<li class="filter-item" id="<%= containerID %>">',
                '<% if (disabled) { %> <div class="filter-mock-no-edit"></div>  <% } %>',
                '<div>',
                '<label for="<%= idFrom %>"><%= caption %></label>',
                '<input <% if (disabled) { %> disabled  <% } %>  class="filter-date" id="<%= idFrom %>" name="<%= attributeFrom %>" type="text" value="<%= from %>">',
                '<input <% if (disabled) { %> disabled  <% } %>  class="filter-date" id="<%= idTo %>" name="<%= attributeTo %>" type="text" value="<%= to %>">',
                '</div>',
                '</li>'
            ].join('')),
            /**
             * @abstract
             * @class DateRangeView
             * @augments FilterView
             * @constructs
             */
            initialize: function (options) {
                this._$filterFrom = null;
                this._$filterTo = null;
                FilterView.prototype.initialize.call(this, options);
            },
            /**
             * @override
             */
            destroy: function () {
                delete this.template;
                if (this._$filterFrom) {
                    this._$filterFrom.datepicker('destroy');
                    delete this._$filterFrom;
                }
                if (this._$filterTo) {
                    this._$filterTo.datepicker('destroy');
                    delete this._$filterTo;
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
                        _this.handleError(error, event, i);
                    });
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
                    idFrom = helpersModule.uniqueID(),
                    idTo = helpersModule.uniqueID(),
                    html = this._getFilterHtml(isVisible, isDisabled, isNextRow, idFrom, idTo);

                $.publish(event, {
                    text: html,
                    counter: i,
                    callback: this._createCallback(idFrom, idTo, isVisible)
                });
            },
            /**
             *
             * @param {String} idFrom
             * @param {String} idTo
             * @param {Boolean} isVisible
             * @returns function
             * @private
             */
            _createCallback: function (idFrom, idTo, isVisible) {
                var _this = this;
                if (isVisible) {
                    return function () {
                        var dateFormat = optionsModule.getSetting('ddmmyyyyFormat'),
                            $filterFrom = $('#' + idFrom),
                            $filterTo = $('#' + idTo);
                        _this._persistLinkToJqueryFilterFrom($filterFrom);
                        _this._persistLinkToJqueryFilterTo($filterTo);

                        $filterFrom.datepicker({
                            format: dateFormat,
                            autoclose: true
                        });

                        $filterTo.datepicker({
                            format: dateFormat,
                            autoclose: true
                        });
                    }
                }
                return function () {
                };
            },
            /**
             *
             * @param {Boolean} isVisible
             * @param {Boolean} isDisabled
             * @param {Boolean} isNextRow
             * @param {string} idFrom
             * @param {string} idTo
             * @returns {string}
             * @private
             */
            _getFilterHtml: function (isVisible, isDisabled, isNextRow, idFrom, idTo) {
                if (isVisible) {
                    var model = this.getModel(),
                        attrFrom = model.getAttributeFrom(),
                        attrTo = model.getAttributeTo(attrFrom),
                        from,
                        to;

                    switch (model.getDefaultValue().toLowerCase()) {
                        case 'currentmonth':
                            var momentInstance = moment(),
                                dateFormat = 'DD.MM.YYYY';
                            from = momentInstance.startOf('month').format(dateFormat);
                            to = momentInstance.endOf("month").format(dateFormat);
                            break;
                        default:
                            break;
                    }

                    return this.template({
                        idFrom: idFrom,
                        idTo: idTo,
                        attributeTo: attrTo,
                        attributeFrom: attrFrom,
                        from: from,
                        to: to,
                        caption: model.getCaption(),
                        attribute: model.getAttribute(),
                        tooltip: model.getTooltip(),
                        disabled: isDisabled,
                        isNextRow: isNextRow,
                        containerID: this.id
                    });
                }
                return '';
            },
            /**
             * @param {jQuery} $filter
             * @private
             */
            _persistLinkToJqueryFilterFrom: function ($filter) {
                this._$filterFrom = $filter;
            },
            /**
             * @param {jQuery} $filter
             * @private
             */
            _persistLinkToJqueryFilterTo: function ($filter) {
                this._$filterTo = $filter;
            }
        });
})(Backbone, jQuery, helpersModule, optionsModule, FilterView);