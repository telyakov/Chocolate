/**
 * Class TextFilterView
 * @class
 * @augments FilterView
 */
var TextFilterView = (function (Backbone, $, helpersModule, FilterView, deferredModule) {
    'use strict';
    return FilterView.extend(
        /** @lends TextFilterView */
        {
            template: _.template([
                '<% if (isNextRow) { %> </div><div class="filter-row"><% } %>',
                '<li class="filter-item" id="<%= containerID %>">',
                '<% if (disabled) { %> <div class="filter-mock-no-edit"></div>  <% } %>',
                '<div class="text-filter" title="<%= tooltip %>">',
                '<label for="<%= id %>"><%= caption %></label>',
                '<input <% if (disabled) { %> disabled  <% } %> attribute="filters[<%= attribute %>]" name="<%= attribute %>"',
                ' placeholder="<%= tooltip %>" class="filter" id="<%= id %>" type="search" value="<%= value %>">',
                '</div>',
                '</li>'
            ].join('')),
            /**
             * @override
             */
            destroy: function () {
                delete this.template;
                FilterView.prototype.destroy.apply(this);
            },
            /**
             * @param event {string}
             * @param i {int}
             * @override
             */
            render: function (event, i) {
                var _this = this,
                    model = this.model;

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
                        if (isVisible) {
                            text = _this.template({
                                id: helpersModule.uniqueID(),
                                caption: model.getCaption(),
                                attribute: model.getAttribute(),
                                tooltip: model.getTooltip(),
                                disabled: isDisabled,
                                isNextRow: isNextRow,
                                value: model.getValue(),
                                //valueFormat: model.getValueFormat(),
                                containerID: _this.id
                            });
                        }
                        $.publish(event, {
                            text: text,
                            counter: i
                        });
                    });

            }
        });
})(Backbone, jQuery, helpersModule, FilterView, deferredModule);