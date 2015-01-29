/**
 * Class CheckBoxView
 * @class
 * @augments FilterView
 */
var CheckBoxView = (function (Backbone, $, helpersModule, FilterView, deferredModule) {
    'use strict';
    return FilterView.extend(
        /** @lends CheckBoxView */
        {
            template: _.template([
                '<% if (isNextRow) { %> </div><div class="filter-row"><% } %>',
                '<li class="filter-item" id="<%= containerID %>">',
                '<div class="checkbox-filter" title="<%= tooltip %>">',
                '<label for="<%= id %>"><%= caption %></label>',
                '<div id="<%= id %>">',
                '<input type="hidden" value="" name="<%= attribute %>"/>',
                '<input name="<%= attribute %>" value="1" type="checkbox"/>',
                '</div>',
                '</div>',
                '</li>'
            ].join('')),
            _$filter: null,
            /**
             * @override
             */
            destroy: function () {
                delete this.template;
                if (this._$filter) {
                    this._$filter.toggleButtons('destroy');
                    delete this._$filter;
                }
                FilterView.prototype.destroy.apply(this);
            },
            /**
             * @param $filter {jQuery|null}
             * @private
             */
            _persistLinkToJqueryFilter: function ($filter) {
                this._$filter = $filter;
            },
            /**
             * @param event {string}
             * @param i {int}
             * @override
             */
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
                        text = '',
                        id = helpersModule.uniqueID();
                    if (isVisible) {
                        text = _this.template({
                            id: id,
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
                            var $filter = $('#' + id);
                            _this._persistLinkToJqueryFilter($filter);
                            $filter.toggleButtons({
                                'onChange': $.noop,
                                'width': 75,
                                'height': 24,
                                'animated': true,
                                'label': {'enabled': 'Да', 'disabled': 'Нет'},
                                'style': {
                                    'enabled': 'checkbox-filter-enabled',
                                    'disabled': 'checkbox-filter-disabled'
                                }
                            });
                        }
                    });
                });

            }
        });
})(Backbone, jQuery, helpersModule, FilterView, deferredModule);