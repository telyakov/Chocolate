/**
 * Class GridView
 * @class
 * @augments AbstractGridView
 */
var GridView = (function (AbstractGridView, $, _, deferredModule, optionsModule, helpersModule, window, undefined, Math) {
    'use strict';
    return AbstractGridView.extend(
        /** @lends GridView */
        {
            template: _.template('<form data-id="<%= view %>" id="<%= id%>"></form>'),
            gridTemplate: _.template([
                    '<section data-id="grid">',
                    '<div id="<%= userGridID %>" class="grid-view">',
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
                    'touchmove .card-button': '_openRowCard',
                    'dblclick .card-button': '_openRowCard',
                    'click .menu-button-add': 'addRowHandler',
                    'keydown .grid-column-search': $.debounce(200, false, this.searchColumnsHandler),
                    'click .menu-button-excel': 'exportToExcel',
                    'click .menu-button-settings': 'openFormSettings',
                    'click .menu-button-toggle': 'toggleSystemCols'
                });
            },

            /**
             * @abstract
             * @class GridView
             * @augments AbstractGridView
             * @param {AbstractViewOptions} options
             * @constructs
             */
            initialize: function (options) {
                this._$taskWizard = null;
                this._menuView = null;
                this._callbacks = null;
                this._$contextMenu = null;
                this._priorityColors = [];
                AbstractGridView.prototype.initialize.call(this, options);
            },
            /**
             * @override
             */
            destroy: function () {
                this.template = null;
                this.gridTemplate = null;
                this.columnHeaderTemplate = null;
                this._callbacks = null;
                this._priorityColors = null;
                this._unsubscribeRefreshEvent();
                if (this._menuView) {
                    this._menuView.destroy();
                    this._menuView = null;
                }
                try {
                    this.$el.contextmenu('destroy');
                } catch (e) {
                    mediator.publish(optionsModule.getChannel('logError'), e);
                }
                this._destroyDragTableWidget();
                this._destroyTableHeadersContextMenuWidget();
                this.undelegateEvents();
                this._destroyTaskWizard();
                AbstractGridView.prototype.destroy.apply(this);
                this.$el = null;
                this.events = null;
            },
            /**
             * @param $taskWizard {jQuery|null}
             * @private
             */
            _persistLinkToWizardTask: function ($taskWizard) {
                this._$taskWizard = $taskWizard
            },
            /**
             * @private
             */
            _destroyTaskWizard: function () {
                if (this._$taskWizard) {
                    this._$taskWizard.chWizard('destroy');
                    this._$taskWizard = null;
                }
            },
            /**
             * @param e {Event}
             * @returns {boolean}
             */
            openWizardTask: function (e) {
                this._destroyTaskWizard();
                var $this = $(e.target),
                    tw = facade.getTaskWizard();
                this._persistLinkToWizardTask($this);
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
            /**
             * @returns {*}
             */
            toggleSystemCols: function () {
                var isHidden = this.model.isSystemColumnsMode(),
                    systemColAttr = optionsModule.getSetting('systemCols'),
                    $th = this.getJqueryFloatHeadTable().find('th').filter(function () {
                        return systemColAttr.indexOf($(this).attr('data-id')) !== -1;
                    });
                this.toggleColumns(isHidden, $th);
                this.getJqueryForm().find('.menu-button-toggle').toggleClass(optionsModule.getClass('menuButtonSelected'));
                this.model.persistSystemColumnsMode(!isHidden);
                return this.clearSelectedArea();
            },
            /**
             * @param isHidden {Boolean}
             * @param $thList {jQuery}
             * @returns {*}
             */
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
                var tableModule = facade.getTableModule();
                if (isHidden) {
                    tableModule.showTableCols(tables, positions);
                    newWidth = curWidth + sum;
                } else {
                    tableModule.hideTableCols(tables, positions);
                    newWidth = curWidth - sum;
                }
                $table.width(newWidth);
                $fixedTable.width(newWidth);
                $table.floatThead('reflow');
                return this;
            },
            /**
             * @param e {Event}
             */
            searchColumnsHandler: function (e) {
                var opm = optionsModule,
                    $this = $(e.target),
                    $th = this.getJqueryFloatHeadTable().find('.tablesorter-headerRow').children('th'),
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
            /**
             * @method openMailClient
             */
            openMailClient: function () {
                var id = this.getActiveRowID();
                if (id) {
                    var data = this.model.getDBDataFromStorage(id),
                        emailColumn = optionsModule.getSetting('emailCol'),
                        emails = data[emailColumn],
                        url = encodeURIComponent(optionsModule.getUrl('bpOneTask') + id),
                        task = helpersModule.stripHtml(data.task),
                        subject = 'База:' + task.substr(0, 50);

                    window.open('mailto:' + emails + '?subject=' + subject + '&body=' + url, '_self');
                }
            },
            /**
             * @method addRowHandler
             */
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
            /**
             * @param data {Object}
             */
            addRow: function (data) {
                if (!data.hasOwnProperty('id')) {
                    data.id = helpersModule.uniqueID();
                }
                var $row = $(this._generateRowHtml(data, this._getSortedColumns()));
                $row.addClass('grid-row-changed');
                this
                    .getJqueryTbody()
                    .prepend($row)
                    .trigger('addRows', [$row, false]);
                var model = this.model,
                    id = data.id;
                model.trigger('change:form', {
                    op: 'ins',
                    id: id,
                    data: $.extend({}, data)
                });
                this._applyColumnsCallbacks($row);
                if (model.isAutoOpenCard()) {
                    model.trigger('open:card', id);
                }
            },
            /**
             * @param opts {Object}
             */
            save: function (opts) {
                if (this.hasChange()) {

                    var _this = this,
                        changedObj = this.model.getChangedDataFromStorage(),
                        dataObj = this.model.getDBDataFromStorage(),
                        deletedData = this.model.getDeletedDataFromStorage(),
                        responseChangeObj = {},
                        name,
                        hasOwn = Object.prototype.hasOwnProperty;
                    for (name in changedObj) {
                        if (hasOwn.call(changedObj, name)) {
                            if (!$.isEmptyObject(changedObj[name])) {
                                if (deletedData[name] === undefined) {
                                    responseChangeObj[name] = helpersModule.merge(dataObj[name], changedObj[name]);
                                }
                            }
                        }
                    }

                    if (!$.isEmptyObject(responseChangeObj) && !$.isEmptyObject(deletedData)) {
                        var rowID;
                        for (rowID in deletedData) {
                            if (hasOwn.call(deletedData, rowID)) {
                                delete responseChangeObj[rowID];
                            }
                        }
                    }

                    var key;
                    for (key in deletedData) {
                        if (hasOwn.call(deletedData, key)) {
                            if (!$.isNumeric(key)) {
                                delete deletedData[key];
                            }
                        }
                    }

                    if (!$.isEmptyObject(responseChangeObj) || !$.isEmptyObject(deletedData)) {
                        //отсекаем изменения в уже удаленных строках, они нам не нужны
                        var errors = [], index;
                        for (index in responseChangeObj) {
                            if (hasOwn.call(responseChangeObj, index)) {
                                var error = this.getModel().validate(responseChangeObj[index]);
                                if (!$.isEmptyObject(error)) {
                                    errors[index] = error;
                                }
                            }
                        }
                        if ($.isEmptyObject(errors)) {
                            var model = this.model;
                            model
                                .runAsyncTaskSave(responseChangeObj, deletedData)
                                .done(function () {
                                    if (opts.refresh) {
                                        model.trigger('refresh:form');
                                    }
                                })
                                .fail(function (jqXHR, textStatus) {
                                    _this.showMessage({
                                        id: 3,
                                        msg: textStatus
                                    });
                                });
                        } else {
                            var pk,
                                $table = this.getJqueryDataTable();
                            for (pk in errors) {
                                if (hasOwn.call(errors, pk)) {
                                    var iterator,
                                        $tr = $table.find('[data-id="' + pk + '"]');
                                    $tr.children('.grid-menu').addClass('grid-error');
                                    for (iterator in errors[pk]) {
                                        if (hasOwn.call(errors[pk], iterator)) {
                                            var columnKey = errors[pk][iterator];
                                            $tr.find('.' + helpersModule.uniqueColumnClass(columnKey)).closest('td').addClass('grid-error');
                                        }
                                    }
                                }
                            }
                            this.showMessage({
                                id: 3,
                                msg: 'Заполните обязательные поля( ошибки подсвечены в сетке).'
                            });
                        }
                    } else {
                        if (opts.refresh) {
                            this.showMessage({
                                id: 2,
                                msg: 'Данные не были изменены.'
                            });
                        }
                    }
                } else {
                    if (opts.refresh) {
                        this.showMessage({
                            id: 2,
                            msg: 'Данные не были изменены.'
                        });
                    }
                }
            },
            /**
             * @param opts {CardSaveDTO}
             * @override
             */
            saveCard: function (opts) {
                var _this = this,
                    model = this.getModel();
                /**
                 * @type {CardView}
                 */
                var cardView = model.getOpenedCard(opts.id);
                if (cardView === undefined) {
                    this.publishError({
                        model: this,
                        error: 'Save card throw errors'
                    });
                }
                if (cardView.isChanged()) {

                    if (cardView.validateData()) {
                        var data = {};
                        data[opts.id] = model.getActualDataFromStorage(opts.id);
                        model
                            .runAsyncTaskSave(data)
                            .done(function (res) {
                                cardView.destroy();
                                //todo: ЧТо делать с карточками в которых есть изменения?
                                model.getAllOpenedCard().forEach(function(view){
                                   view.destroy();
                                });
                                _this.refresh();
                            })
                            .fail(function (res) {
                                cardView.showMessage(res);
                            })
                    }

                } else {
                    cardView.destroy();
                }
            },
            /**
             * @param {jQuery} $cnt
             * @returns {Deferred[]}
             */
            _applyColumnsCallbacks: function ($cnt) {
                var view = this,
                    asyncTasks = [];
                this._getCallbacks().forEach(function (fn) {
                    var defer = deferredModule.create();
                    asyncTasks.push(defer);
                    fn($cnt, view, defer);
                });
                return asyncTasks;
            },
            /**
             * @param e {Event}
             * @private
             */
            _openRowCard: function (e) {
                var id = $(e.target).closest('tr').attr('data-id');
                this.getModel().trigger('open:card', id);
            },
            /**
             * @desc Render Form
             */
            render: function () {
                var formId = this.getFormID(),
                    html = this.template({
                        id: formId,
                        view: this.getModel().getView()
                    });
                this.$el.html(html);
                var $form = this.getJqueryForm();
                this._layoutMenu();
                this._layoutForm();
                this.layoutFooter();
            },
            /**
             * @desc For fight with leak memory
             * @param view {?MenuView}
             * @private
             */
            _persistReferenceToMenuView: function (view) {
                this._menuView = view;
            },
            _layoutMenu: function () {
                var menuView = new MenuView({
                    view: this,
                    $el: this.getJqueryForm()
                });
                this._persistReferenceToMenuView(menuView);
                menuView.render();
            },
            /**
             * @override
             * @desc Perform form refresh
             */
            refresh: function () {
                this._runAsyncRefreshFormTask();
                var collection = this.getModel().getFiltersROCollection(this);
                collection.each(
                    /** @param {FilterRO} filter */
                        function (filter) {
                        if (filter.isAutoRefresh()) {
                            filter.refresh(collection);
                        }
                    })
            },
            /**
             * @desc Get columns callback functions
             * @returns {Function[]}
             * @private
             */
            _getCallbacks: function () {
                if (this._callbacks === null) {
                    var callbacks = [];
                    this.getModel().getColumnsROCollection().each(
                        /** @param {ColumnRO} column */
                            function (column) {
                            callbacks.push(column.getJsFn());
                        });
                    this._callbacks = callbacks;
                }
                return this._callbacks;
            },
            /**
             * @desc Get Array of ColumnRO with correct order
             * @returns {ColumnRO[]}
             */
            _getSortedColumns: function () {
                var sortedColumnCollection = [],
                    model = this.getModel(),
                    hasSetting = model.hasSettings(),
                    iterator = 1,
                    index,
                    _this = this;
                model.getColumnsROCollection().each(
                    /** @param {ColumnRO} column */
                        function (column) {
                        if (hasSetting) {
                            index = _this.getPositionColumn(column.get('key'));
                        } else {
                            index = iterator;
                            iterator += 1;
                        }
                        sortedColumnCollection[index] = column;
                    });
                return sortedColumnCollection;
            },
            /**
             * @desc Layout main form
             * @private
             */
            _layoutForm: function () {
                var _this = this,
                    model = this.getModel(),
                    roCollection = model.getColumnsROCollection(),
                    hasSetting = model.hasSettings(),
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

                var newColumns = [];
                roCollection.each(function (column) {
                    if (!hasSetting) {
                        setting[iterator] = {
                            key: column.get('key'),
                            weight: iterator,
                            width: optionsModule.getSetting('defaultColumnsWidth')
                        };
                        iterator += 1;
                    }
                    var index = hasSetting ? _this.getPositionColumn(column.get('key')) : iterator - 1;
                    var config = {
                        options: column.getHeaderOptions(),
                        header: _this.columnHeaderTemplate({
                            'class': column.getHeaderCLass(),
                            caption: column.getCaption()
                        })
                    };
                    if (index === undefined) {
                        newColumns.push(config);
                    }
                    rows[index] = config;
                });
                newColumns.forEach(function (item) {
                    rows.push(item);
                });
                model.persistColumnsSettings(setting);

                this.getJqueryForm().append(this.gridTemplate({
                    userGridID: userGridID,
                    rows: rows,
                    tableID: helpersModule.uniqueID()
                }));

                this
                    ._initTableScripts()
                    ._runAsyncRefreshFormTask();
            },
            /**
             * @desc Destroy Context Menu Widget for table headers
             * @private
             */
            _destroyTableHeadersContextMenuWidget: function () {
                if (this._$contextMenu) {
                    this._$contextMenu.contextmenu('destroy');
                    this._$contextMenu = null;
                }
            },
            /**
             * @desc For fight with leak memory
             * @param {?jQuery} $elem
             * @private
             */
            _persistReferenceToHeadersContextMenu: function ($elem) {
                this._$contextMenu = $elem;
            },
            /**
             * @desc Initialize context menu widgets for <th> in table
             * @param {jQuery} $table
             */
            _initTableHeadersContextMenuWidget: function ($table) {
                var $fixedTable = this.getJqueryFloatHeadTable(),
                    $th = $fixedTable.children('thead').find('th'),
                    $sortedTh = $th.filter(function (i) {
                        return i > 0;
                    }),
                    _this = this,
                    count = Object.keys(this.getModel().getFormSettingsFromStorage()).length - 1,
                    realCount = $th.length - 1,
                    tables = [$table.eq(0)[0], $fixedTable.eq(0)[0]];
                this._persistReferenceToHeadersContextMenu($sortedTh);
                $sortedTh.contextmenu({
                    show: {effect: 'blind', duration: 0},
                    menu: [
                        {title: '< Сделать первой', cmd: 'to-first'},
                        {title: 'Сделать последней >', cmd: 'to-last'},
                        {title: 'Все колонки', cmd: 'toggle-cols'}
                    ],
                    select: function (event, ui) {
                        var fromReal = ui.target.closest('th').get(0).cellIndex,
                            from = _this.getPositionColumn(ui.target.closest('th').attr('data-id'));
                        switch (ui.cmd) {
                            case 'to-first':
                                facade.getTableModule().swapTableCols(tables, fromReal, 1);
                                $table.floatThead('reflow');
                                _this.changeSettings(from, 1);
                                break;
                            case 'to-last':
                                facade.getTableModule().swapTableCols(tables, fromReal, realCount);
                                $table.floatThead('reflow');
                                _this.changeSettings(from, count);
                                break;
                            case 'toggle-cols':
                                _this
                                    ._toggleAllCols()
                                    .clearSelectedArea();
                                break;
                            default :
                                break;
                        }
                    }
                });
                return this;
            },
            /**
             * @desc Changing places columns
             * @param {Number} start
             * @param {Number} end
             */
            changeSettings: function (start, end) {
                var model = this.getModel(),
                    min = 1,
                    settings = model.getFormSettingsFromStorage();
                if (!$.isEmptyObject(settings)) {
                    /**
                     *
                     * @type {SettingsColumn[]}
                     */
                    var newSettings = [],
                        obj,
                        i,
                        hasOwn = Object.prototype.hasOwnProperty,
                        newWeight;
                    if (start < end) {
                        for (i in settings) {
                            if (hasOwn.call(settings, i)) {
                                obj = settings[i];
                                if (obj.weight === 0) {
                                    newSettings[0] = {
                                        key: obj.key,
                                        weight: obj.weight,
                                        width: obj.width
                                    };
                                } else {
                                    if (obj.weight > start && obj.weight <= end) {
                                        newWeight = obj.weight - 1;
                                        newSettings[newWeight] = {
                                            key: obj.key,
                                            weight: newWeight,
                                            width: obj.width
                                        };
                                    } else if (obj.weight === start) {
                                        newWeight = Math.max(end, min);
                                        newSettings[newWeight] = {
                                            key: obj.key,
                                            weight: newWeight,
                                            width: obj.width
                                        };
                                    } else {
                                        newSettings[obj.weight] = {
                                            key: obj.key,
                                            weight: obj.weight,
                                            width: obj.width
                                        };
                                    }
                                }
                            }
                        }
                    }
                    if (start > end) {
                        for (i in settings) {
                            if (hasOwn.call(settings, i)) {
                                obj = settings[i];
                                if (obj.weight === 0) {
                                    newSettings[0] = {
                                        key: obj.key,
                                        weight: obj.weight,
                                        width: obj.width
                                    };
                                } else {
                                    if (obj.weight < start && obj.weight >= Math.max(end, min)) {
                                        newWeight = obj.weight + 1;
                                        newSettings[newWeight] = {
                                            key: obj.key,
                                            weight: newWeight,
                                            width: obj.width
                                        };
                                    } else if (obj.weight === start) {
                                        newWeight = Math.max(end, min);
                                        newSettings[newWeight] = {
                                            key: obj.key,
                                            weight: newWeight,
                                            width: obj.width
                                        };
                                    } else {
                                        newSettings[obj.weight] = {
                                            key: obj.key,
                                            weight: obj.weight,
                                            width: obj.width
                                        };
                                    }
                                }
                            }
                        }
                    }
                    model.persistColumnsSettings(newSettings);
                }
            },
            /**
             * @desc Toggle columns visible mode
             * @returns {*}
             * @private
             */
            _toggleAllCols: function () {
                var model = this.getModel(),
                    isHidden = model.isShortMode(),
                    $th = this.getJqueryFloatHeadTable()
                        .find('[' + optionsModule.getClass('allowHideColumn') + ']');
                this.toggleColumns(isHidden, $th);
                model.setShortMode(!isHidden);
                return this;
            },
            /**
             * @desc Destroy draggable table widget
             * @private
             */
            _destroyDragTableWidget: function () {
                //todo: check destroy view
                this.getJqueryFloatHeadTable().dragtable('destroy');
            },
            /**
             * @desc Initialize draggable table widget
             * @returns {*}
             */
            _initDragTableWidget: function () {
                this.getJqueryFloatHeadTable().dragtable({
                    view: this
                });
                return this;
            },
            /**
             * @desc Initialize all scripts for table
             * @returns {*}
             * @private
             */
            _initTableScripts: function () {
                var model = this.getModel(),
                    $table = this.getJqueryDataTable();
                this
                    .initSettings()
                    .initTableSorterWidget($table)
                    .initResizeWidget($table)
                    .initFloatTheadWidget($table)
                    ._initTableHeadersContextMenuWidget($table)
                    ._initDragTableWidget();
                if (model.isShortMode()) {
                    var $shortCols = this.getJqueryFloatHeadTable()
                        .find('[' + optionsModule.getClass('allowHideColumn') + ']');
                    this.toggleColumns(false, $shortCols);
                }
                if (model.isSystemColumnsMode()) {
                    var $systemCols = this.getJqueryFloatHeadTable().find('th')
                        .filter(function () {
                            return optionsModule
                                .getSetting('systemCols')
                                .indexOf($(this).attr('data-id')) !== -1;
                        });
                    this.toggleColumns(false, $systemCols);
                }

                return this._initContextRowWidget();
            },
            /**
             * @desc Initialize widget for context menu in controls columns in grid
             * @private
             * @returns {*}
             */
            _initContextRowWidget: function () {
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
                return this;
            },
            /**
             * @desc Run async form refresh
             * @private
             */
            _runAsyncRefreshFormTask: function () {
                var _this = this,
                    model = this.getModel(),
                    view = this.view,
                    card = view.getCard(),
                    cardSql;
                if (card) {
                    cardSql = card.get('column').getSql();
                }
                model
                    .runAsyncTaskBindingReadProc(view.getFilterData(), cardSql)
                    .done(
                    /** @param {SqlBindingResponse} data */
                        function (data) {
                        model.runAsyncTaskGetData(data.sql)
                            .done(_this._refreshDone);
                    });
            },
            /**
             * @desc Unbind refresh events
             * @private
             */
            _unsubscribeRefreshEvent: function () {
                $.unsubscribe(this.getLayoutSubscribeName());
                this.getJqueryGridView().unbind('scroll.chocolate');
                this.getJqueryDataTable().unbind('sortEnd').unbind('filterEnd');
            },
            /**
             * @desc Done callback for async Task of Get Form Data
             * @param {RecordsetDTO} data
             * @private
             */
            _refreshDone: function (data) {
                var sortedColumnCollection = this._getSortedColumns(),
                    order = data.order,
                    recordset = data.data;
                this.model.persistData(recordset, order);
                var html = this._generateRowsHtml(recordset, order, sortedColumnCollection),
                    $table = this.getJqueryDataTable(),
                    $tbody = this.getJqueryTbody(),
                    $tr,
                    _this = this,
                    cacheVisible = [],
                    $userGrid = this.getJqueryGridView(),
                    subscribeName = this.getLayoutSubscribeName();
                this._unsubscribeRefreshEvent();
                $.subscribe(subscribeName,
                    /**
                     * @param e
                     * @param {boolean} isRefreshCache
                     */
                        function (e, isRefreshCache) {
                        var scrollTop = $userGrid.scrollTop();
                        if (isRefreshCache || !$tr) {
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
                            startIndex = Math.max(parseInt(scrollTop / trHeight, 10) - 7, 0),
                            endIndex = Math.min(parseInt((scrollTop + visibleHeight) / trHeight, 10) + 7, $tr.length);
                        $tr
                            .filter(function (i) {
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
                                if (isRefreshCache) {
                                    return true;
                                }
                            }
                            return false;
                        })
                            .find('.table-td')
                            .css({display: 'none'});
                    });
                var prevScrollTop = 0;
                $userGrid.on('scroll.chocolate', $.debounce(150, false, function () {
                    /**
                     * @type {jQuery}
                     */
                    var $this = $(this),
                        curScrollTop = $this.scrollTop();
                    if (curScrollTop !== prevScrollTop) {
                        $.publish(subscribeName, false);
                    }
                    prevScrollTop = curScrollTop;
                }));

                $tbody.html(html);
                var asyncTasks = this._applyColumnsCallbacks(this.$el);
                $.when.apply($, asyncTasks).done(function () {
                    $table.trigger('update');
                });

                $table.bind('sortEnd filterEnd', function () {
                    _this.clearSelectedArea();
                    $.publish(subscribeName, true);
                });
                $.publish(subscribeName, true);
                this.setRowCount(Object.keys(recordset).length);
            },
            /**
             * @desc Create Html for all Row
             * @param {Object} data
             * @param {Array} order
             * @param {ColumnRO[]} columns
             * @returns {string}
             * @private
             */
            _generateRowsHtml: function (data, order, columns) {
                var stringBuilder = [],
                    _this = this;
                order.forEach(function (key) {
                    //count++;
                    stringBuilder.push(_this._generateRowHtml(data[key], columns));
                });
                return stringBuilder.join('');
            },
            /**
             * @desc Create Single Row Html
             * @param {Object}  data
             * @param {ColumnRO[]} columns
             * @returns {string}
             */
            _generateRowHtml: function (data, columns) {
                var style = '',
                    keyColor = '',
                    model = this.getModel(),
                    colorCol = model.getColorColumnName(),
                    keyColorCol = model.getKeyColorColumnName();
                if (colorCol && data[colorCol]) {
                    var correctColor = helpersModule.decToHeh(data[colorCol]);
                    style = ['style="background:#', correctColor, '"'].join('');
                }
                if (keyColorCol && data[keyColorCol]) {
                    keyColor = helpersModule.decToHeh(data[keyColorCol])
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
                    ],
                    key,
                    thList = this.getTh();
                columns.forEach(
                    /** @param {ColumnRO} item */
                        function (item) {
                        key = item.get('key');
                        var isVisible = thList.filter('[data-id="' + key + '"]').css('display') !== "none",
                            value = '',
                            color;
                        if (data[key] !== undefined && (key !== 'id' || isNumericID )) {
                            value = data[key];
                            if (value) {
                                value = value.replace(/"/g, '&quot;');
                            }
                        }
                        if (key === 'id') {
                            color = keyColor;
                        }
                        rowBuilder.push(
                            item.getTemplate(id, isVisible, value, color)
                        );
                    });
                rowBuilder.push('</tr>');
                return rowBuilder.join('');
            },
            /**
             * @desc Add Row color and priority to storage and apply it
             * @param {String} id
             * @param {String} priority
             * @param {String} color
             */
            addPriorityColorAndApply: function (id, priority, color) {
                if (this._priorityColors[id] === undefined) {
                    this._priorityColors[id] = [];
                }
                this._priorityColors[id].push({priority: priority, color: '#' + color});
                this._applyRowColor(id);
            },
            /**
             * @desc Apply background color for row
             * @param {String} id
             * @returns {*}
             * @private
             */
            _applyRowColor: function (id) {
                var color = this._getRowColor(id);
                this.getJqueryDataTable().find('tr[data-id="' + id + '"]').css({
                    background: color ? color : ''
                });
                return this;
            },
            /**
             * @param {string} id
             * @param {Number} priority
             */
            removePriorityColorAndApply: function (id, priority) {
                if (this._priorityColors[id] !== undefined) {
                    var _this = this;
                    this._priorityColors[id].forEach(function (item, index) {
                        if (item.priority === priority) {
                            delete _this._priorityColors[id][index];
                        }
                    });
                }
                this._applyRowColor(id);
            },
            /**
             * @desc Get Row Color by Id
             * @param {string} id
             * @returns {?String}
             * @private
             */
            _getRowColor: function (id) {
                if (this._priorityColors[id] !== undefined) {
                    var color = null, prevPriority;
                    this._priorityColors[id].forEach(function (item) {
                        if (prevPriority === undefined || item.priority < prevPriority) {
                            prevPriority = item.priority;
                            color = item.color;
                        }
                    });
                    return color;
                }
                return null;
            }

        });
})
(AbstractGridView, jQuery, _, deferredModule, optionsModule, helpersModule, window, undefined, Math);