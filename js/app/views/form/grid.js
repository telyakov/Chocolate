var GridView = (function (AbstractGridView, $, _, deferredModule, optionsModule, factoryModule) {
    'use strict';
    return AbstractGridView.extend({
        template: _.template([
                '<form action="/grid/save?view=<%=view %>" data-id="<%= view %>" id="<%= id%>"',
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
        events: function () {
            return _.extend({}, AbstractGridView.prototype.events, {
                'touchmove .card-button': 'openCard',
                'dblclick .card-button': 'openCard'
            });
        },
        selectRow: function (e) {
            var $this = $(e.target).closest('tr'),
                form = facade.getFactoryModule().makeChGridForm($this.closest('form'));
            form.selectRow($this, e.ctrlKey || e.shiftKey, true);
        },
        openCard: function (e) {
            if (this.model.hasCard()) {
                var $this = $(e.target),
                    pk = $this.closest('tr').attr('data-id');
                this.openCardHandler(pk);
            }
        },
        render: function () {
            var formId = this.getFormID(),
                html = this.template({
                    id: formId,
                    view: this.model.getView(),
                    ajaxAdd: this.model.isSupportCreateEmpty(),
                    parentPk: this.model.get('parentId'),
                    cardSupport: this.model.hasCard()

                });
            this.$el.html(html);
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
        refresh: function () {
            this.refreshData();
        },
        _callbacks: null,
        getCallbacks: function () {
            if (this._callbacks === null) {
                var callbacks = [],
                    $cnt = this.$el;
                this.model.getColumnsROCollection().each(function (column) {
                    callbacks.push(column.getJsFn($cnt));
                });
                this._callbacks = callbacks;
            }
            return this._callbacks;
        },
        getSortedColumns: function (form) {
            var sortedColumnCollection = [],
                hasSetting = form.hasSettings(),
                iterator = 1,
                index;
            this.model.getColumnsROCollection().each(function (column) {
                if (hasSetting) {
                    index = form.getPositionColumn(column.get('key'));
                } else {
                    index = iterator;
                    iterator++;
                }
                sortedColumnCollection[index] = column;
            });
            return sortedColumnCollection;
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
            roCollection.each(function (column) {
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
            this.refreshData();


        },
        initTableScript: function ($table) {
            facade.getFactoryModule().makeChTable($table).initScript();
        },
        refreshData: function () {
            var _this = this,
                mainSql;
            if (this.view.card) {
                mainSql = this.view.card.get('column').getSql();
            }
            this.model
                .deferReadProc(this.view.getFilterData(), mainSql)
                .done(function (data) {
                    var sql = data.sql,
                        defer = deferredModule.create(),
                        deferID = deferredModule.save(defer);
                    mediator.publish(optionsModule.getChannel('socketRequest'), {
                        query: sql,
                        type: optionsModule.getRequestType('chFormRefresh'),
                        id: deferID
                    });
                    defer.done(function (data) {
                        _this.refreshDone(data);
                    });
                });
        },
        refreshDone: function (data) {
            var form = factoryModule.makeChGridForm($('#' + this.getFormID())),
                callbacks = this.getCallbacks(),
                sortedColumnCollection = this.getSortedColumns(form),
                order = data.order,
                recordset = data.data;
            form.saveInStorage(recordset, this.model.getPreview(), {}, {}, {}, order);

            var html = this.generateRows(recordset, order, sortedColumnCollection, form),
                $table = form.getTable(),
                $tbody = $table.find('tbody'),
                $tr,
                cacheVisible = [],
                $userGrid = form._getUserGrid(),
                subscribeName = form.getLayoutSubscribeName();
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
            form.setRowCount(Object.keys(recordset).length);
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
        generateRow: function (data, columns, form) {
            var style = '',
                idClass = '',
                colorCol = this.model.getColorColumnName(),
                keyColorCol = this.model.getKeyColorColumnName(),
                rowClass = '';
            if (colorCol && data[colorCol]) {
                var correctColor = helpersModule.decToHeh(data[colorCol]);
                style = ['style="background:#', correctColor, '"'].join('');
            }
            if (keyColorCol && data[keyColorCol]) {
                idClass = ' td-red';
            }
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

            var key,
                thList = form.getTh();
            columns.forEach(function (item) {
                key = item.get('key');
                var isVisible = thList.filter('[data-id="' + key + '"]').css('display') !== "none";
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
                    item.getTemplate(isVisible).replace(/\{pk\}/g, id)
                        .replace(/\{rel\}/g, rel)
                        .replace(/\{value\}/g, value)
                        .replace(/\{class2\}/g, class2)
                );
            });
            rowBuilder.push('</tr>');
            return rowBuilder.join('');
        },
        layoutFooter: function ($form) {
            $form.after(this.footerTemplate());
        }
    });
})(AbstractGridView, jQuery, _, deferredModule, optionsModule, factoryModule);