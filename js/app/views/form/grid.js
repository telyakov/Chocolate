var GridView = (function (Backbone) {
    'use strict';
    return Backbone.View.extend({
        template: _.template([
                '<form action="/grid/save?view=<%=view %>" data-id="<%= view %>" id="<%= id%>"',
                'data-parent-id="<%= parentID%>" ',
                'data-ajax-add="<%= ajaxAdd%>" ',
                'data-parent-pk="<%= parentPk%>" ',
                'data-card-support="<%= cardSupport%>" ',
                '>',
                '</form>'
            ].join('')
        ),
        gridTemplate: _.template([
                '<section data-id="grid">',
                '<div data-id="user-grid" id="<%= userGridID %>" class="grid-view">',
                '<table tabindex=0 class="table-bordered items" id="<%= tableID%>">',
                '<thead><tr>',
                '<% _.each(rows, function(item) { %>',
                '<th ',
                '<% _.each(item.options, function(value, name) { %>',
                '<%= name%>',
                '="',
                '<%= value%>',
                '" ',
                ' <% }); %>',
                '><%= item.header%></th>',
                ' <% }); %>',
                '</tr></thead>',
                '<tbody>',
                '</tbody>',
                '</table>',
                '</div>',
                '</section>'
            ].join('')
        ),
        columnHeaderTemplate: _.template([
                '<div><a><span class="<%= class %>"></span>',
                '<span class="grid-caption">',
                '<%= caption%>',
                '</span><span class="grid-sorting"></span>',
                '</a></div>'
            ].join('')
        ),
        footerTemplate: _.template([
                '<footer class="grid-footer" data-id="grid-footer">',
                '<div class="footer-info" data-id="info"></div>',
                '<div class="footer-counter"></div>',
                '</footer>'
            ].join('')
        ),
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.$el = options.$el;
            this.model = options.model;
            if (options.dataParentId) {
                this.dataParentId = options.dataParentId;
            }
            this.render();
        },
        events: {},

        render: function () {
            var formId = helpersModule.uniqueID(),
                html = this.template({
                    id: formId,
                    view: this.model.getView(),
                    parentID: this.dataParentId,
                    ajaxAdd: this.model.isSupportCreateEmpty(),
                    parentPk: this.model.get('parentId'),
                    cardSupport: this.model.hasCard()

                });
            this.$el.append(html);
            var $form = $('#' + formId);
            this.layoutMenu($form);
            this.layoutForm($form);
            this.layoutFooter($form);
        },
        layoutMenu: function ($form) {
            var menuView = new MenuView({
                model: this.model,
                $el: $form
            });
        },
        layoutForm: function ($form) {
            var form = factoryModule.makeChGridForm($form),
                _this = this,
                roCollection = this.model.getColumnsROCollection(),
                hasSetting = form.hasSettings(),
                rows = [{
                    options: {'data-id': 'chocolate-control-column'},
                    header: ''
                }],
                userGridID = helpersModule.uniqueID(),
                setting = [],
                iterator = 1;
            if (!hasSetting) {
                setting[0] = {
                    key: 'chocolate-control-column',
                    weight: 0,
                    width: '28'
                };
            }
            var callbacks = [],
                $cnt = this.$el,
                sortedColumnCollection = [];
            roCollection.each(function (column) {
                callbacks.push(column.getJsFn($cnt));
                if (!hasSetting) {
                    setting[iterator] = {
                        key: column.get('key'),
                        weight: iterator,
                        width: ChOptions.settings.defaultColumnsWidth
                    };
                    iterator++;
                }
                var index = hasSetting ? form.getPositionColumn(column.get('key')) : iterator - 1;
                rows[index] = {
                    options: column.getHeaderOptions(),
                    header: _this.columnHeaderTemplate({
                        'class': column.getHeaderCLass(),
                        caption: column.getCaption()
                    })
                };
                sortedColumnCollection[index] = column;
            });

            if (!hasSetting) {
                form.setSettingsObj(setting);
            }
            var tableID = helpersModule.uniqueID();
            $form.append(this.gridTemplate({
                userGridID: userGridID,
                rows: rows,
                tableID: tableID
            }));
            var $table = $('#' + tableID);
            this.initTableScript($table);
            this.initData(callbacks, sortedColumnCollection, form);


        },
        initTableScript: function ($table) {
            facade.getFactoryModule().makeChTable($table).initScript();
        },
        initData: function (callbacks, sortedColumnCollection, form) {
            var defer = deferredModule.create(),
                deferID = deferredModule.save(defer),
                model = this.model,
                _this = this;

            model.readProcEval(deferID);
            defer.done(function (data) {
                var sql = data.sql;
                var deferRead = deferredModule.create(),
                    deferReadID = deferredModule.save(deferRead);
                mediator.publish(optionsModule.getChannel('socketRequest'), {
                    query: sql,
                    type: optionsModule.getRequestType('chFormRefresh'),
                    id: deferReadID
                });
                deferRead.done(function (data) {
                    var order = data.order,
                        recordset = data.data;
                    var html = _this.generateRows(recordset, order, sortedColumnCollection, form);

                    var $table = form.getTable();
                    var $tbody = $table.find('tbody'), $tr, cacheVisible = [],
                        $userGrid = form._getUserGrid(), subscribeName = form.getLayoutSubscribeName();
                    $.unsubscribe(subscribeName);
                    $.subscribe(subscribeName, function (e, refreshCache) {
                        var scrollTop = $userGrid.scrollTop();
                        if (refreshCache || !$tr) {
                            $tr = $tbody.children('tr').filter(':not(.filtered)');
                            cacheVisible = [];
                        }
                        var trHeight = $tr.eq(2).height();
                        if (!trHeight) {
                            if ($tr.hasClass('ch-mobile')) {
                                trHeight = 67;
                            } else {
                                trHeight = 23;
                            }
                        }
                        var visibleHeight = $userGrid.height(),
                            startIndex = Math.max((scrollTop / trHeight ^ 0 ) - 7, 0),
                            endIndex = Math.min(((scrollTop + visibleHeight) / trHeight ^ 0) + 7, $tr.length);
                        $tr.filter(function (i) {
                            if (i >= startIndex && i <= endIndex) {
                                if (cacheVisible[i]) {
                                    return false;
                                }
                                cacheVisible[i] = 1;
                                return true;
                            }
                            return false;
                        })
                            .find('.table-td')
                            .css({display: 'block'});
                        $tr.filter(function (i) {
                            if (i < startIndex || i > endIndex) {
                                if (cacheVisible[i]) {
                                    delete cacheVisible[i];
                                    return true;
                                }
                                if (refreshCache) {
                                    return true;
                                }
                            }
                            return false;
                        })
                            .find('.table-td')
                            .css({display: 'none'});
                    });

                    var prevScrollTop = 0;
                    $userGrid.unbind('scroll.chocolate').on('scroll.chocolate', $.debounce(150, false, function () {
                        var curScrollTop = $(this).scrollTop();
                        if (curScrollTop !== prevScrollTop) {
                            $.publish(subscribeName, false);
                        }
                        prevScrollTop = curScrollTop;
                    }));

                    $tbody.html(html);
                    callbacks.forEach(function (fn) {
                        fn();
                    });
                    $table.trigger("update");
                    $table.unbind('sortEnd').unbind('filterEnd').bind('sortEnd filterEnd', function () {
                        form.clearSelectedArea();
                        $.publish(subscribeName, true);
                    });
                    $.publish(subscribeName, true);
                    form.setRowCount(Object.keys(data).length);
                });

            });
        },
        generateRow: function (data, columns, form) {
            var style = '',
                idClass = '',
                colorCol = this.model.getColorColumnName(),
                keyColorCol = this.model.getKeyColorColumnName(),
                rowClass = '';
            if (colorCol && data[colorCol]) {
                var decColor = parseInt(data[colorCol], 10),
                    hexColor = decColor.toString(16);
                if (hexColor.length < 6) {
                    while (hexColor.length < 6) {
                        hexColor += '0' + hexColor;
                    }
                }
                var R = [hexColor.charAt(4), hexColor.charAt(5)].join(''),
                    G = [hexColor.charAt(2), hexColor.charAt(3)].join(''),
                    B = [hexColor.charAt(0), hexColor.charAt(1)].join('');
                style = ['style="background:#', R, G, B, '"'].join('');
            }
            if (keyColorCol && data[keyColorCol]) {
                idClass = ' td-red';
            }
            //
            if (form.chFormSettings.getGlobalStyle() === 2) {
                rowClass = 'class="ch-mobile"';
            }
            var id = data.id,
                isNumericID = $.isNumeric(id),
                rowBuilder = [
                    '<tr data-id="',
                    id,
                    '"',
                    style,
                    rowClass,
                    '>',
                    ChGridForm.TEMPLATE_FIRST_TD
                ];

            var key, _this = this;
            columns.forEach(function (item) {

                var value = '', class2 = '',
                    rel = [form.getUserGridID(), key].join('_');
                if (data[key] !== undefined && (key !== 'id' || isNumericID )) {
                    value = data[key];
                    if (value) {
                        value = value.replace(/"/g, '&quot;');
                    }
                }
                if (key === 'id') {
                    class2 = idClass;
                }
                rowBuilder.push(
                    item.getTemplate().replace(/\{pk\}/g, id)
                        .replace(/\{rel\}/g, rel)
                        .replace(/\{value\}/g, value)
                        .replace(/\{class2\}/g, class2)
                );
            });
            rowBuilder.push('</tr>');
            return rowBuilder.join('');


        },
        generateRows: function (data, order, sortedColumnCollection, form) {
            var count = 0,
                stringBuilder = [];
            var _this = this;
            order.forEach(function (key) {
                count++;
                stringBuilder.push(_this.generateRow(data[key], sortedColumnCollection, form));
            });
            return stringBuilder.join('');
        },
        layoutFooter: function ($form) {
            $form.after(this.footerTemplate());
        }
    });
})(Backbone);