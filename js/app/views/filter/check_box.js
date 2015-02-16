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
                //'<div id="<%= id %>">',
                //'<input type="hidden" value="" name="<%= attribute %>"/>',
                '<input id="<%= id %>" name="<%= attribute %>" type="checkbox"/>',
                //'</div>',
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
                            $filter.bootstrapSwitch({
                                size: 'small',
                                onText: 'Да',
                                offText: 'Нет',
                                onSwitchChange: function(event, state){
                                    if(state){
                                        $filter.val(1);
                                    }
                                }
                            });
                        }
                    });
                });

            }
        });
})(Backbone, jQuery, helpersModule, FilterView, deferredModule);