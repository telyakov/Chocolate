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
                    model.runAsyncTaskIsVisibleIsEnabled(),
                    model.runAsyncTaskIsNextRow()
                )
                    .done(function (v1, v2, v3) {
                        var isDisabled = !v2.value,
                            isVisible = v1.value,
                            isNextRow = v3.value,
                            text = '';

                        var defaultValue = model.getDefaultValue(),
                            attrFrom = model.getAttributeFrom(),
                            attrTo = model.getAttributeTo(attrFrom),
                            from,
                            to;

                        switch (defaultValue.toLowerCase()) {
                            case 'currentmonth':
                                var momentInstance = moment(),
                                    dateFormat = 'DD.MM.YYYY';
                                from = momentInstance.startOf('month').format(dateFormat);
                                to = momentInstance.endOf("month").format(dateFormat);
                                break;
                            default:
                                break;
                        }

                        var idFrom = helpersModule.uniqueID(),
                            idTo = helpersModule.uniqueID();
                        if (isVisible) {
                            text = _this.template({
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
                                containerID: _this.id
                            });
                        }
                        $.publish(event, {
                            text: text,
                            counter: i,
                            callback: function () {
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
                        });
                    })
                    .fail(function (error) {
                        $.publish(event, {
                            text: '',
                            counter: i,
                            callback: function () {
                            }
                        });
                        _this.publishError({
                            error: error,
                            view: _this
                        })
                    });
            }
        });
})(Backbone, jQuery, helpersModule, optionsModule, FilterView);