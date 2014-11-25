var TextFilterView = (function (Backbone, $, helpersModule) {
    'use strict';
    return Backbone.View.extend({
        template: _.template([
            '<li class="filter-item" data-format="<%= valueFormat %>" id="<%= containerID %>">',
            '<div class="text-filter" title="<%= tooltip %>">',
            '<label for="<%= id %>"><%= caption %></label>',
            '<input <% if (disabled) { %> disabled  <% } %> attribute="filters[<%= attribute %>]" name="GridForm[filters][<%= attribute %>]"',
            ' placeholder="<%= tooltip %>)" class="filter" id="<%= id %>" type="search" value="<%= value %>">',
            '</div>'
        ].join('')),
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.model = options.model;
            this.id = options.id;
        },
        events: {},

        render: function () {
            var model = this.model;
            return this.template({
                id: helpersModule.uniqueID(),
                caption: model.getCaption(),
                attribute:  model.getAttribute(),
                tooltip: model.getTooltip(),
                disabled: model.isDisabled(),
                value: model.getDefaultValue(),
                valueFormat: model.getValueFormat(),
                containerID: this.id
            });
        }
    });
})(Backbone, jQuery, helpersModule);