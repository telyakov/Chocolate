/**
 * Class DateRangeView
 * @class
 * @augments FilterView
 */
var DateRangeView = (function (Backbone, $, helpersModule, FilterView, deferredModule) {
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
            _$filterFrom: null,
            _$filterTo: null,
            /**
             * @override
             */
            destroy: function () {
                delete this.template;
                if (this._$filterFrom) {
                    this._$filterFrom.datepicker( "destroy" );
                    delete this._$filterFrom;
                }
                if (this._$filterTo) {
                    this._$filterTo.datepicker( "destroy" );
                    delete this._$filterTo;
                }
                FilterView.prototype.destroy.apply(this);
            },
            /**
             * @param $filter {jQuery|null}
             * @private
             */
            _persistLinkToJqueryFilterFrom: function ($filter) {
                this._$filterFrom = $filter;
            },
            /**
             * @param $filter {jQuery|null}
             * @private
             */
            _persistLinkToJqueryFilterTo: function ($filter) {
                this._$filterTo = $filter;
            },
            render: function (event, i) {
                var _this = this,
                    model = this.model,
                    visibleDf = deferredModule.create(),
                    enabledDf = deferredModule.create(),
                    nextRowDf = deferredModule.create(),
                    visibleId = deferredModule.save(visibleDf),
                    nextRowId = deferredModule.save(nextRowDf),
                    enabledId = deferredModule.save(enabledDf);

                model.isVisibleEval(visibleId);
                model.isEnabledEval(enabledId);
                model.isNextRowEval(nextRowId);
                $.when(visibleDf, enabledDf, nextRowDf).done(function (v1, v2, v3) {
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
                            from = moment().startOf('month').format('DD.MM.YYYY');
                            to = moment().endOf("month").format('DD.MM.YYYY');
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
                            var $filterFrom = $('#' + idFrom),
                                $filterTo = $('#' + idTo);
                            _this._persistLinkToJqueryFilterFrom($filterFrom);
                            _this._persistLinkToJqueryFilterTo($filterTo);
                            $filterFrom.datepicker({
                                format: 'dd.mm.yyyy',
                                autoclose: true
                            });
                            $filterTo.datepicker({
                                format: 'dd.mm.yyyy',
                                autoclose: true
                            });
                        }
                    });
                });

            }
        });
})(Backbone, jQuery, helpersModule, FilterView, deferredModule);