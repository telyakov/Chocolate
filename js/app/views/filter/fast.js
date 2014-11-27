var FastFilterView = (function (Backbone, $, helpersModule, FilterView, deferredModule) {
    'use strict';
    return FilterView.extend({
        template: _.template([
            '<% if (isNextRow) { %> </div><div class="filter-row"><% } %>',
            '<li class="fast-filter filter-item" id="<%= containerID %>" ',
            ' <% if (isAutoRefresh) { %> data-auto-ref=1  <% } %> name="<%= attribute %>"',
            ' <% if (parentFilterKey) { %> rel="<%= parentFilterKey %>"  <% } %> >',
            '<input type="hidden" name="GridForm[filters][<%= attribute %>]">',

            '<% if (!parentFilterKey) { %>',
            '<% if (isMultiSelect) { %>',
            '<% _.each(data, function(item) { %>',
            '<span class="checkbox inline">',
            '<input id="<%= item.id %>" value="<%= item.val + "11"  %>" type="checkbox" name="GridForm[filters][<%= attribute %>][]">',
            '<label for="<%= item.id %>" ><%= item.name %></label>',
            '</span>',
            ' <% }); %>',
            '<% }else{ %>',
            '<% _.each(data, function(item) { %>',
            '<span class="radio inline">',
            '<input id="<%= item.id %>" value="<%= item.val %>|" type="radio" name="GridForm[filters][<%= attribute %>][]">',
            '<label for="<%= item.id %>"><%= item.name %></label>',
            '</span>',
            ' <% }); %>',
            '<% } %>',
            '<% } %>',
            '</li>'
        ].join('')),
        render: function (event, i) {
            var _this = this,
                model = this.model,
                visibleDf = deferredModule.create(),
                dataDf = deferredModule.create(),
                nextRowDf = deferredModule.create(),
                multiSelectDf = deferredModule.create(),
                multiSelectId = deferredModule.save(multiSelectDf),
                dataId = deferredModule.save(dataDf),
                visibleId = deferredModule.save(visibleDf),
                nextRowId = deferredModule.save(nextRowDf);

            model.isVisibleEval(visibleId);
            model.isNextRowEval(nextRowId);
            model.isMultiSelectEval(multiSelectId);
            model.dataEval(dataId);

            $.when(visibleDf, nextRowDf, multiSelectDf, dataDf).done(function (visible, nextRow, multiSelect, dataRes) {
                var isVisible = visible.value,
                    isNextRow = nextRow.value,
                    data = dataRes.data,
                    isMultiSelect = multiSelect.value,
                    text = '';
                var prepareData = [],
                    j,
                    hasOwnProperty = Object.prototype.hasOwnProperty;
                for (j in data) {
                    if (hasOwnProperty.call(data, j)) {
                        prepareData.push({
                            id: helpersModule.uniqueID(),
                            val: data[j].id,
                            name: data[j].name
                        });
                    }
                }
                if (isVisible) {
                    text = _this.template({
                        attribute: model.getAttribute(),
                        isNextRow: isNextRow,
                        parentFilterKey: model.getProperties().get('parentFilter'),
                        isMultiSelect: isMultiSelect,
                        isAutoRefresh: model.getProperties().get('isAutoRefresh'),
                        data: prepareData,
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