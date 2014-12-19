var TreeFilterView = (function (Backbone, $, helpersModule, FilterView, deferredModule) {
    'use strict';
    return FilterView.extend({
        template: _.template([
            '<% if (isNextRow) { %> </div><div class="filter-row"><% } %>',
            '<li class="filter-item" id="<%= containerID %>">',
            '<% if (disabled) { %> <div class="filter-mock-no-edit"></div>  <% } %>',
            '<div class="tree-container" title="<%= tooltip %>">',
            '<label for="<%= id %>"><%= caption %></label>',
            '<select <% if (disabled) { %> disabled  <% } %> >',
            '</select>',
            '<input <% if (disabled) { %> disabled  <% } %> class="tree-button" id="<%= buttonId %>" title="Кликните, чтобы выбрать фильтр" type="button">',
            '<input name="<%= attribute %>" id="<%= id %>" type="hidden">',
            '</div>',
            '</li>'
        ].join('')),
        events: {},
        getSelectMode: function (isMultiSelect) {
            return (isMultiSelect) ? 2 : 1;
        },
        render: function (event, i) {
            var _this = this,
                model = this.model,
                visibleDf = deferredModule.create(),
                enabledDf = deferredModule.create(),
                nextRowDf = deferredModule.create(),
                multiSelectDf = deferredModule.create(),
                visibleId = deferredModule.save(visibleDf),
                nextRowId = deferredModule.save(nextRowDf),
                multiSelectId = deferredModule.save(multiSelectDf),
                enabledId = deferredModule.save(enabledDf);

            var defer = model.readProcEval();
            model.isVisibleEval(visibleId);
            model.isEnabledEval(enabledId);
            model.isMultiSelectEval(multiSelectId);
            model.isNextRowEval(nextRowId);
            $.when(visibleDf, enabledDf, nextRowDf, multiSelectDf, defer)
                .done(function (visible, enabled, nextRow, multiSelect, sqlDefer) {
                    var isDisabled = !enabled.value,
                        isVisible = visible.value,
                        isNextRow = nextRow.value,
                        isMultiSelect = multiSelect.value,
                        sql = sqlDefer.sql,
                        text = '',
                        filterProperties = model.getProperties();
                    if (isVisible) {
                        var buttonId = helpersModule.uniqueID();
                        text = _this.template({
                            isNextRow: isNextRow,
                            disabled: isDisabled,
                            containerID: _this.id,
                            tooltip: model.getTooltip(),
                            id: helpersModule.uniqueID(),
                            caption: model.getCaption(),
                            attribute: model.getAttribute(),
                            buttonId: buttonId
                        });
                        var selector = 'click #' + buttonId,
                            defaultOpts = {
                                debugLevel: 0,
                                checkbox: true,
                                selectMode: _this.getSelectMode(isMultiSelect),
                                onQuerySelect: function (flag, node) {
                                    chFunctions.treeOnQuerySelect(flag, node);
                                }
                            },
                            opts = $.extend({}, defaultOpts, {
                                children: [],
                                sql: sql,
                                expand_nodes: filterProperties.get('expandNodes'),
                                select_all: filterProperties.get('selectAllNodes'),
                                restore_state: filterProperties.get('restoreState'),
                                separator: filterProperties.get('delimiter'),
                                root_id: filterProperties.get('rootID'),
                                title: model.getCaption(),
                                column_title: filterProperties.get('columnTitle'),
                                column_id: filterProperties.get('columnID'),
                                column_parent_id: filterProperties.get('columnParentID'),
                                infoPanel: true
                            });
                        _this.events[selector] = function (e) {
                            var dnt = facade.getFactoryModule().makeChDynatree($(e.target));
                            dnt.buildFromSql(opts);
                            e.stopImmediatePropagation();
                        };
                        _this.delegateEvents();
                    }
                    $.publish(event, {
                        text: text,
                        counter: i
                    });
                });

        }
    });
})(Backbone, jQuery, helpersModule, FilterView, deferredModule);