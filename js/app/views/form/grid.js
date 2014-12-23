var GridView = (function (AbstractGridView, $, _, deferredModule, optionsModule, helpersModule, window, undefined) {
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
                'dblclick .card-button': 'openCard',
                'click .menu-button-add': 'addRowHandler'
            });
        },
        openMailClient: function () {
            var id = this.getActiveRowID();
            if (id) {
                var data = this.getDBDataFromStorage(id),
                    emailColumn = optionsModule.getSetting('emailCol'),
                    emails = data[emailColumn],
                    url = encodeURIComponent(optionsModule.getUrl('bpOneTask') + id),
                    task = helpersModule.stripHtml(data.task),
                    subject = 'База:' + task.substr(0, 50);

                window.open('mailto:' + emails + '?subject=' + subject + '&body=' + url, '_self');
            }
        },
        addRowHandler: function () {
            var defValues = this.model.getColumnsDefaultValues(),
                _this = this;
            if (this.model.isSupportCreateEmpty()) {
                var defer = this.model.deferDefaultData();
                defer.done(function (res) {
                    var data = res.data,
                        i,
                        hasOwn = Object.prototype.hasOwnProperty,
                        result;
                    for (i in data) {
                        if (hasOwn.call(data, i)) {
                            result = data[i];
                            break;
                        }
                    }
                    defValues = $.extend(defValues, result);
                    _this.addRow(defValues);
                });
            } else {
                _this.addRow(defValues);
            }
        },
        addRow: function (data) {
            if (!data.hasOwnProperty('id')) {
                data.id = helpersModule.uniqueID();
            }
            var $row = $(this.generateRow(data, this.getSortedColumns()));
            $row.addClass('grid-row-changed');
            this
                .getJqueryTbody()
                .prepend($row)
                .trigger('addRows', [$row, false]);
            var model = this.model,
                id = data.id;
            model.trigger('change:form', {
                op: 'upd',
                id: id,
                data: $.extend({}, data)
            });
            this.applyCallbacks($row);
            if (model.isAutoOpenCard()) {
                this.openCardHandler(id);
            }

        },
        applyCallbacks: function ($cnt) {
            this.getCallbacks().forEach(function (fn) {
                fn($cnt);
            });
            return this;
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
            var $form = this.getJqueryForm();
            this.layoutMenu($form);
            this.layoutForm($form);
            this.layoutFooter($form);
        },
        layoutMenu: function ($form) {
            var menuView = new MenuView({
                view: this,
                $el: $form
            });
        },
        refresh: function () {
            this.refreshData();
        },
        _callbacks: null,
        getCallbacks: function () {
            if (this._callbacks === null) {
                var callbacks = [];
                this.model.getColumnsROCollection().each(function (column) {
                    callbacks.push(column.getJsFn());
                });
                this._callbacks = callbacks;
            }
            return this._callbacks;
        },
        getSortedColumns: function () {
            var sortedColumnCollection = [],
                hasSetting = this.hasSettings(),
                iterator = 1,
                index,
                _this = this;
            this.model.getColumnsROCollection().each(function (column) {
                if (hasSetting) {
                    index = _this.getPositionColumn(column.get('key'));
                } else {
                    index = iterator;
                    iterator++;
                }
                sortedColumnCollection[index] = column;
            });
            return sortedColumnCollection;
        },
        layoutForm: function ($form) {
            var _this = this,
                roCollection = this.model.getColumnsROCollection(),
                hasSetting = this.hasSettings(),
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
                var index = hasSetting ? _this.getPositionColumn(column.get('key')) : iterator - 1;
                rows[index] = {
                    options: column.getHeaderOptions(),
                    header: _this.columnHeaderTemplate({
                        'class': column.getHeaderCLass(),
                        caption: column.getCaption()
                    })
                };
            });

            if (!hasSetting) {
                this.persistFormSettings(setting);
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
                    var defer = _this.model.deferReadData(data.sql);
                    defer.done(function (data) {
                        _this.refreshDone(data);
                    });
                });
        },
        refreshDone: function (data) {
            var sortedColumnCollection = this.getSortedColumns(),
                order = data.order,
                recordset = data.data;
            this.persistData(recordset, order);

            var html = this.generateRows(recordset, order, sortedColumnCollection),
                $table = this.getJqueryDataTable(),
                $tbody = this.getJqueryTbody(),
                $tr,
                _this = this,
                cacheVisible = [],
                $userGrid = this.getJqueryGridView(),
                subscribeName = this.getLayoutSubscribeName();
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
            this.applyCallbacks(this.$el);
            $table.trigger("update");
            $table.unbind('sortEnd').unbind('filterEnd').bind('sortEnd filterEnd', function () {
                _this.clearSelectedArea();
                $.publish(subscribeName, true);
            });
            $.publish(subscribeName, true);
            this.setRowCount(Object.keys(recordset).length);
        },
        generateRows: function (data, order, sortedColumnCollection) {
            var stringBuilder = [];
            var _this = this;
            order.forEach(function (key) {
                //count++;
                stringBuilder.push(_this.generateRow(data[key], sortedColumnCollection));
            });
            return stringBuilder.join('');
        },
        generateRow: function (data, columns) {
            var style = '',
                idClass = '',
                colorCol = this.model.getColorColumnName(),
                keyColorCol = this.model.getKeyColorColumnName();
            if (colorCol && data[colorCol]) {
                var correctColor = helpersModule.decToHeh(data[colorCol]);
                style = ['style="background:#', correctColor, '"'].join('');
            }
            if (keyColorCol && data[keyColorCol]) {
                idClass = ' td-red';
            }
            var rowClass = this.getRowClass();
            if(rowClass){
                rowClass = 'class="' + rowClass + '"';
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
                    '<td class="grid-menu"><span class="card-button" data-id="card-button" title="Открыть карточку"></span>'
                ];

            var key,
                gridViewID = this.getJqueryGridView().attr('id'),
                thList = this.getTh();
            columns.forEach(function (item) {
                key = item.get('key');
                var isVisible = thList.filter('[data-id="' + key + '"]').css('display') !== "none";
                var value = '', class2 = '',
                    rel = [gridViewID, key].join('_');
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
        }
    });
})(AbstractGridView, jQuery, _, deferredModule, optionsModule, helpersModule, window, undefined);