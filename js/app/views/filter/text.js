var TextFilterView = (function (Backbone, $, helpersModule, FilterView) {
    'use strict';
    return FilterView.extend({
        template: _.template([
            '<li class="filter-item" data-format="<%= valueFormat %>" id="<%= containerID %>">',
            '<div class="text-filter" title="<%= tooltip %>">',
            '<label for="<%= id %>"><%= caption %></label>',
            '<input <% if (disabled) { %> disabled  <% } %> attribute="filters[<%= attribute %>]" name="GridForm[filters][<%= attribute %>]"',
            ' placeholder="<%= tooltip %>)" class="filter" id="<%= id %>" type="search" value="<%= value %>">',
            '</div>'
        ].join('')),
        render: function (event, i) {
            var model = this.model;
            $.publish(event, {
                text: this.template({
                    id: helpersModule.uniqueID(),
                    caption: model.getCaption(),
                    attribute: model.getAttribute(),
                    tooltip: model.getTooltip(),
                    disabled: model.isDisabled(),
                    value: model.getDefaultValue(),
                    valueFormat: model.getValueFormat(),
                    containerID: this.id
                }),
                counter: i
            });
        }
    });
})(Backbone, jQuery, helpersModule, FilterView);