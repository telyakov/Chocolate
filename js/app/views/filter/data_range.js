var DateRangeView = (function (Backbone, $, helpersModule, FilterView, deferredModule) {
    'use strict';
    return FilterView.extend({
        template: _.template([
            '<% if (isNextRow) { %> </div><div class="filter-row"><% } %>',
            '<li class="filter-item" id="<%= containerID %>">',
            '<% if (disabled) { %> <div class="filter-mock-no-edit"></div>  <% } %>',
            '<div>',
            '<label for="<%= idFrom %>"><%= caption %></label>',
            '<input <% if (disabled) { %> disabled  <% } %>  class="filter-date" id="<%= idFrom %>" name="GridForm[filters][<%= attributeFrom %>]" type="text" value="<%= from %>">',
            '<input <% if (disabled) { %> disabled  <% } %>  class="filter-date" id="<%= idTo %>" name="GridForm[filters][<%= attributeTo %>]" type="text" value="<%= to %>">',
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
                    callback: function(){
                        $('#' + idFrom).datepicker({'format':'dd.mm.yyyy','autoclose':'true'});
                        $('#' + idTo).datepicker({'format':'dd.mm.yyyy','autoclose':'true'});
                    }
                });
            });

        }
    });
})(Backbone, jQuery, helpersModule, FilterView, deferredModule);