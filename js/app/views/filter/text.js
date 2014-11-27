var TextFilterView = (function (Backbone, $, helpersModule, FilterView, deferredModule) {
    'use strict';
    return FilterView.extend({
        template: _.template([
            '<% if (isNextRow) { %> </div><div class="filter-row"><% } %>',
            '<li class="filter-item" data-format="<%= valueFormat %>" id="<%= containerID %>">',
        '<% if (disabled) { %> <div class="filter-mock-no-edit"></div>  <% } %>',
            '<div class="text-filter" title="<%= tooltip %>">',
            '<label for="<%= id %>"><%= caption %></label>',
            '<input <% if (disabled) { %> disabled  <% } %> attribute="filters[<%= attribute %>]" name="GridForm[filters][<%= attribute %>]"',
            ' placeholder="<%= tooltip %>)" class="filter" id="<%= id %>" type="search" value="<%= value %>">',
            '</div>',
            '</li>'
        ].join('')),
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
                if (isVisible) {
                    text = _this.template({
                        id: helpersModule.uniqueID(),
                        caption: model.getCaption(),
                        attribute: model.getAttribute(),
                        tooltip: model.getTooltip(),
                        disabled: isDisabled,
                        isNextRow: isNextRow,
                        value: model.getDefaultValue(),
                        valueFormat: model.getValueFormat(),
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