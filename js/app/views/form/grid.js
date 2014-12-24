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
                'click .menu-button-add': 'addRowHandler',
                'keydown .grid-column-search': $.debounce(200, false, this.searchColumnsHandler),
                'click .menu-button-excel': 'exportToExcel',
                'click .menu-button-settings': 'openFormSettingHandler',
                'click .menu-button-toggle': 'toggleSystemCols'
            });
        },
        openWizardTask: function (e) {
            var $this = $(e.target),
                tw = facade.getTaskWizard();
            $this.chWizard('init', {
                commandObj: tw.makeCommandObject(this),
                onDone: tw.onDoneFunc(),
                commands: [
                    tw.makeServiceCommand(),
                    tw.makeExecutorsCommand(),
                    tw.makeDescriptionCommand()
                ]
            });
            return false;
        },
        toggleSystemCols: function () {
            var isHidden = this.isSystemColumnsMode(),
                systemColAttr = optionsModule.getSetting('systemCols'),
                $th = this.getJqueryFloatHeadTable().find('th').filter(function () {
                    return systemColAttr.indexOf($(this).attr('data-id')) !== -1;
                });
            this.toggleColumns(isHidden, $th);
            this.getJqueryForm().find('.menu-button-toggle').toggleClass(optionsModule.getClass('menuButtonSelected'));
            return this
                .persistSystemColumnsMode(!isHidden)
                .clearSelectedArea();
        },
        toggleColumns: function (isHidden, $thList) {
            var positions = [],
                $fixedTable = this.getJqueryFloatHeadTable(),
                $table = this.getJqueryDataTable(),
                tables = [$table.eq(0)[0], $fixedTable.eq(0)[0]],
                sum = 0,
                curWidth = $table.width(),
                newWidth,
                _this = this,
                cellIndex;
            $thList.each(function () {
                cellIndex = $(this).get(0).cellIndex;
                positions.push(cellIndex);
                sum += parseInt(_this.getColumnWidth(cellIndex), 10);
            });
            if (isHidden) {
                facade.getTableModule().showTableCols(tables, positions);
                newWidth = curWidth + sum;
            } else {
                facade.getTableModule().hideTableCols(tables, positions);
                newWidth = curWidth - sum;
            }
            $table.width(newWidth);
            $fixedTable.width(newWidth);
            $table.floatThead('reflow');
        },
        exportToExcel: function () {
            var data = {
                data: $.extend(true, this.getDBDataFromStorage(), this.getChangedDataFromStorage()),
                view: this.model.getView(),
                settings: this.getFormSettingsFromStorage()
            };
            $.fileDownload(
                optionsModule.getUrl('export2excel'),
                {
                    httpMethod: "POST",
                    data: {data: JSON.stringify(data)}
                }
            );
        },
        openFormSettingHandler: function (e) {
            var $dialog = $('<div/>'),
                $content = $('<div />', {'class': 'grid-settings'}),
                $autoUpdate = $('<div/>', {
                    'class': 'setting-item',
                    html: '<span class="setting-caption">Автоматические обновление данных(раз в 100 секунд)</span>'
                }),
                $input = $('<input/>', {
                    type: 'checkbox'
                }),
                $styleSettings = $('<div/>', {
                    'class': 'setting-item',
                    html: '<span class="setting-caption">Выбрать дизайн(необходимо обновить страницу, после изменения)</span>'
                }),
            //todo: move int to constants
                $styleInput = $('<select/>', {
                    html: '<option value="1">Стандартный</option><option value="2">Мобильный</option>'
                }),
                _this = this;
            if (this.isAutoUpdate()) {
                $input.attr('checked', 'checked');
            }
            $styleInput.find('[value="' + this.getFormStyleID() + '"]').attr('selected', true);
            $styleSettings.append($styleInput);
            $autoUpdate.append($input);
            $content
                .append($styleSettings)
                .append($autoUpdate);
            $dialog.append($content);
            $dialog.dialog({
                resizable: false,
                title: 'Настройки',
                dialogClass: 'wizard-dialog',
                modal: true,
                buttons: {
                    OK: {
                        'text': 'OK',
                        'class': 'wizard-active wizard-next-button',
                        click: function () {
                            var $this = $(this);
                            _this.setAutoUpdate($input.is(':checked'));
                            _this.setFormStyleID(parseInt($styleInput.val(), 10));
                            $this.dialog("close");
                            $this.remove();
                        }
                    },
                    Отмена: {
                        'text': 'Отмена',
                        'class': 'wizard-cancel-button',
                        click: function () {
                            var $this = $(this);
                            $this.dialog('close');
                            $this.remove();
                        }
                    }

                }
            });
            $dialog.dialog('open');
        },
        searchColumnsHandler: function (e) {
            var opm = optionsModule,
                $this = $(e.target),
                $th = this.getTh(),
                searchedClass = opm.getClass('searchedColumn'),
                $fixedTable = this.getJqueryFloatHeadTable(),
                $table = this.getJqueryDataTable(),
                tables = [$table.eq(0)[0], $fixedTable.eq(0)[0]],
                search = $this.val();
            if ([opm.getKeyCode('enter'), opm.getKeyCode('escape')].indexOf(e.keyCode) === -1) {

                var oldHiddenPositions = [],
                    hiddenPositions = [];
                $th.each(function (i) {
                    var $this = $(this),
                        index = $this.get(0).cellIndex;
                    if ($this.hasClass(searchedClass)) {
                        oldHiddenPositions.push(index);
                    }
                    if ($this.css('display') !== 'none' || $this.hasClass(searchedClass)) {
                        var caption = $(this).text().toLowerCase();
                        $this.removeClass(searchedClass);

                        if (i !== 0 && caption !== opm.getSetting('keyCaption') && caption.indexOf(search) === -1) {
                            hiddenPositions.push(index);
                            $this.addClass(searchedClass);
                        }
                    }
                });
                var visiblePositions = [],
                    sum = 0,
                    curWidth = $table.width(),
                    newWidth,
                    _this = this;
                oldHiddenPositions.forEach(function (item) {
                    if (hiddenPositions.indexOf(item) === -1) {
                        visiblePositions.push(item);
                        sum += parseInt(_this.getColumnWidth(item), 10);
                    }
                });

                var newHiddenPositions = [];
                hiddenPositions.forEach(function (item) {
                    if (oldHiddenPositions.indexOf(item) === -1) {
                        newHiddenPositions.push(item);
                        sum -= parseInt(_this.getColumnWidth(item), 10);
                    }
                });
                var tableHelperModule = facade.getTableModule();
                tableHelperModule.hideTableCols(tables, newHiddenPositions);
                tableHelperModule.showTableCols(tables, visiblePositions);
                newWidth = curWidth + sum;
                $table.width(newWidth);
                $fixedTable.width(newWidth);
                $table.floatThead('reflow');
            } else {
                $(this).val('');
                var positions = [];
                $th.each(function (i) {
                    if ($(this).hasClass(searchedClass)) {
                        positions.push(i);
                        $(this).removeClass(searchedClass);
                    }
                });
                facade.getTableModule().showTableCols(tables, positions);
                if (e.keyCode === opm.getKeyCode('escape')) {
                    $th
                        .filter('.grid-column-searched-red, .grid-column-searched-yellow, .grid-column-searched-green')
                        .removeClass('grid-column-searched-red grid-column-searched-yellow grid-column-searched-green');
                } else {
                    var $parent = $th.parent(),
                        color = $parent.attr('data-color');
                    if (!color || color === 'green') {
                        $parent.attr('data-color', 'yellow');
                    }
                    if (color === 'yellow') {
                        $parent.attr('data-color', 'red');
                    }
                    if (color === 'red') {
                        $parent.attr('data-color', 'green');
                    }
                    $th.each(function () {
                        var caption = $(this).text().toLowerCase();
                        if (caption.indexOf(search) !== -1) {
                            $(this)
                                .removeClass('grid-column-searched-red grid-column-searched-yellow grid-column-searched-green')
                                .addClass('grid-column-searched-' + $parent.attr('data-color'));
                        } else {
                            $(this).removeClass('grid-column-searched-' + $parent.attr('data-color'));

                        }
                    });

                }
            }
            this.clearSelectedArea();
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
                this.persistColumnsSettings(setting);
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
            this.initContextFormMenuEvent();
        },
        initContextFormMenuEvent: function () {
            var _this = this;
            this.$el.contextmenu({
                delegate: '.card-button',
                show: {effect: 'blind', duration: 0},
                menu: [
                    {
                        title: optionsModule.getMessage('Delete') + ' [DEL]',
                        cmd: 'delete',
                        uiIcon: 'ui-icon-trash'
                    }
                ],
                select: function (e, ui) {
                    switch (ui.cmd) {
                        case 'delete':
                            _this.removeSelectedRows();
                            break;
                        default :
                            break;
                    }
                }
            });
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
            if (rowClass) {
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