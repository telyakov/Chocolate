/**
 * Class TreeFilterView
 * @class
 * @augments FilterView
 */
var TreeFilterView = (function (Backbone, $, helpersModule, FilterView, deferredModule) {
    'use strict';
    return FilterView.extend(
        /** @lends TreeFilterView */
        {
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
            /**
             * @param isMultiSelect {Boolean}
             * @returns {number}
             * @private
             */
            _getSelectMode: function (isMultiSelect) {
                return (isMultiSelect) ? 2 : 1;
            },
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
                                    selectMode: _this._getSelectMode(isMultiSelect),
                                    onQuerySelect: function treeOnQuerySelect(flag, node) {
                                        if (node.childList === null) {
                                            return true;
                                        } else {
                                            for (var i in node.childList) {
                                                if (node.childList.hasOwnProperty(i)) {
                                                    node.childList[i].select(flag);
                                                }
                                            }
                                        }
                                        return true;
                                    }
                                },
                                opts = $.extend({}, defaultOpts, {
                                    children: [],
                                    sql: sql,
                                    expandNodes: filterProperties.get('expandNodes'),
                                    selectAll: filterProperties.get('selectAllNodes'),
                                    restoreState: filterProperties.get('restoreState'),
                                    separator: filterProperties.get('delimiter'),
                                    rootID: filterProperties.get('rootID'),
                                    title: model.getCaption(),
                                    columnTitle: filterProperties.get('columnTitle'),
                                    columnID: filterProperties.get('columnID'),
                                    columnParentID: filterProperties.get('columnParentID'),
                                    infoPanel: true,
                                    getInput: function () {
                                        return this.parent().children('input[type=hidden]');
                                    }
                                });
                            _this.events[selector] = function (e) {
                                //todo: fix leak memory
                                var model = new DynatreeModel({
                                    $el: $(e.target),
                                    options: opts
                                });
                                var view = new FilterDynatreeView({
                                    model: model
                                });
                                view.render();
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