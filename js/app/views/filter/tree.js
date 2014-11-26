var TreeFilterView = (function (Backbone, $, helpersModule, FilterView) {
    'use strict';
    return FilterView.extend({
        template: _.template([
            //'<li class="filter-item" data-format="<%= valueFormat %>" id="<%= containerID %>">',
            //'<div class="text-filter" title="<%= tooltip %>">',
            //'<label for="<%= id %>"><%= caption %></label>',
            //'<input <% if (disabled) { %> disabled  <% } %> attribute="filters[<%= attribute %>]" name="GridForm[filters][<%= attribute %>]"',
            //' placeholder="<%= tooltip %>)" class="filter" id="<%= id %>" type="search" value="<%= value %>">',
            //'</div>'
        ].join('')),
        render: function (event, i) {
            var model = this.model;
            //console.log(model.getReadProc())
            //console.log(model.isMultiSelect())
            $.publish(event,{
                text: 'semen',
                counter: i
            });
            //var defer = $.Deferred();
            //var filtered = defer.then(function( value ) {
            //    console.log(model)
            //    return value * 2;
            //}).then(function(val){console.log(val); return val*5;});
            //defer.resolve(5);
            //filtered.done(function( value ) {
            //    console.log(value);
            //});
            //return '';
            //return this.template({
            //    id: helpersModule.uniqueID(),
            //    caption: model.getCaption(),
            //    attribute:  model.getAttribute(),
            //    tooltip: model.getTooltip(),
            //    disabled: model.isDisabled(),
            //    value: model.getDefaultValue(),
            //    valueFormat: model.getValueFormat(),
            //    containerID: this.id
            //});
        }
    });
})(Backbone, jQuery, helpersModule, FilterView);