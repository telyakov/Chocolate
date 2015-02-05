/**
 * Class AbstractGridView
 * @class
 * @augments AbstractView
 */
var AbstractGridView = (function (undefined, Math, $, _, AbstractView, optionsModule, helpersModule, moment) {
    'use strict';
    return AbstractView.extend(
        /** @lends AbstractGridView */
        {
            events: {
                'keydown .tablesorter': 'movingInGridByKeyboard',
                'click tbody > tr': 'selectRowHandler',
                'click .menu-button-expand': 'changeFullScreenMode',
                'click .menu-button-save': '_saveHandler',
                'click .menu-button-action': '_openContextMenu',
                'click .menu-button-print': '_openContextMenu'
            },
            _selectedTimerID: 0,
            _previewTimerID: 0,
            _$resizableElements: null,
            _messageTimerID: 0,
            /**
             * @description Destroy class
             */
            destroy: function () {
                if (this._selectedTimerID) {
                    clearTimeout(this._selectedTimerID);
                    delete this._selectedTimerID;
                }
                if (this._previewTimerID) {
                    clearTimeout(this._previewTimerID);
                    delete this._previewTimerID;
                }
                if (this._messageTimerID) {
                    clearTimeout(this._messageTimerID);
                    delete this._messageTimerID;
                }
                this.undelegateEvents();
                this._destroyResizableWidget();
                this._destroyTableSorterWidget();
                this._destroyFloatTheadWidget();
                AbstractView.prototype.destroy.apply(this);
                this.events = null;
            },
            /**
             * @description Open context menu
             * @param e {Event}
             * @private
             */
            _openContextMenu: function (e) {
                /**
                 * @type {jQuery}
                 */
                var $this = $(e.target).closest('button');
                $this.contextmenu('open', $this);
            },
            /**
             * @description Trigger FormModel save
             * @fires FormModel#save:form
             * @private
             */
            _saveHandler: function () {
                /**
                 *
                 * @type {SaveDTO}
                 */
                var saveDto = {
                    refresh: true
                };
                this.getModel().trigger('save:form', saveDto);
            },

            /**
             * @description Get Jquery object, where shows form messages
             * @returns {jQuery}
             * @private
             */
            _getJqueryMessageContainer: function () {
                return this.getJqueryForm().children('.menu').children('.messages-container');
            },
            /**
             * @description Show application message in form
             * @param opts {MessageDTO}
             * @override
             */
            showMessage: function (opts) {
                /**
                 *
                 * @type {jQuery}
                 */
                var $output = this._getJqueryMessageContainer(),
                    messageClass;
                switch (opts.id) {
                    case 1:
                        messageClass = 'alert-success';
                        break;
                    case 2:
                        messageClass = 'alert-warning';
                        break;
                    case 3:
                        messageClass = 'alert-error';
                        break;
                }
                /**
                 * @type {jQuery}
                 */
                var $msg = $('<div>', {
                    'class': 'alert in alert-block fade ' + messageClass,
                    html: opts.msg
                }).wrap('<div class="grid-message"></div>');
                $output.html($msg);

                if (opts.id !== 3) {
                    if (this._messageTimerID) {
                        clearTimeout(this._messageTimerID);
                    }
                    this._messageTimerID = setTimeout(function () {
                        $output.html('')
                    }, 5000);
                }
            },
            /**
             * @description Allow move back and forth by keyboard in grid,
             *  select/deselect rows for mass operations
             * @param {Event} e
             * @returns {boolean}
             */
            movingInGridByKeyboard: function (e) {
                //span for ie fix
                if (['TABLE', 'SPAN'].indexOf(e.target.tagName) !== -1) {
                    var op = optionsModule,
                        keyCode = e.keyCode,
                        catchKeys = [
                            op.getKeyCode('up'),
                            op.getKeyCode('down'),
                            op.getKeyCode('del')
                        ];
                    if (catchKeys.indexOf(keyCode) !== -1) {
                        var $activeRow,
                            $nextRow;

                        if (keyCode === op.getKeyCode('del')) {
                            this.removeRows(this.getSelectedRows());
                        } else if ((e.ctrlKey || e.shiftKey) && [op.getKeyCode('up'), op.getKeyCode('down')].indexOf(keyCode) !== -1) {
                            $activeRow = this.getJqueryActiveRow();
                            if (keyCode === op.getKeyCode('down')) {
                                $nextRow = $activeRow.next('tr');
                            } else {
                                $nextRow = $activeRow.prev('tr');
                            }
                            if ($nextRow.length) {
                                this
                                    .setCorrectScroll($nextRow)
                                    .selectRow($nextRow, true, false);
                            }
                        } else if ([op.getKeyCode('up'), op.getKeyCode('down')].indexOf(keyCode) !== -1) {
                            $activeRow = this.getJqueryActiveRow();
                            if (keyCode === op.getKeyCode('up')) {
                                $nextRow = $activeRow.prev('tr');
                            } else {
                                $nextRow = $activeRow.next('tr');
                            }
                            if ($nextRow.length) {
                                this
                                    .setCorrectScroll($nextRow)
                                    .selectRow($nextRow, false, false);
                            }
                        }
                        return false;
                    }
                }
                return true;
            },
            /**
             * @param {jQuery} $row
             * @returns {*}
             */
            setCorrectScroll: function ($row) {
                var $userGrid = this.getJqueryGridView(),
                    leftBound = $userGrid.find('thead').height(),
                    rightBound = $userGrid.height() - leftBound,
                    rowTopOffset = $row.offset().top - $userGrid.offset().top;

                if (rowTopOffset < leftBound || rowTopOffset > rightBound) {
                    $userGrid.scrollTop($userGrid.scrollTop() + rowTopOffset - rightBound);
                }
                $.publish(this.getLayoutSubscribeName(), false);
                return this;
            },
            /**
             * @returns {string}
             */
            getLayoutSubscribeName: function () {
                return ['layout', this.getFormID()].join('');
            },
            /**
             * @returns {jQuery}
             */
            getJqueryGridView: function () {
                return this.$('.grid-view');
            },
            /**
             * @returns {jQuery}
             */
            getJqueryTbody: function () {
                return this.getJqueryDataTable().children('tbody');
            },
            /**
             * @returns {jQuery}
             */
            getJqueryDataTable: function () {
                return this.getJqueryGridView().find('table');
            },
            /**
             * @returns {jQuery}
             */
            getJqueryFloatHeadTable: function () {
                return this.$('.floatThead-table');
            },
            /**
             * @param {Number} index
             * @returns {Number}
             */
            getColumnWidth: function (index) {
                var settings = this.getModel().getFormSettingsFromStorage();
                if ($.isEmptyObject(settings)) {
                    var defaultWidth = optionsModule.getSetting('defaultColumnsWidth');
                    this.setColumnWidth(index, defaultWidth);
                    return defaultWidth;
                }
                return settings[index].width;
            },
            /**
             * @description Mark row as selected
             * @param {Event} e
             */
            selectRowHandler: function (e) {
                var $this = $(e.target).closest('tr');
                this.selectRow($this, e.ctrlKey || e.shiftKey, true);
            },
            /**
             * @desc Select row
             * @param {jQuery} $row
             * @param {Boolean} group
             * @param {Boolean} isMouse
             */
            selectRow: function ($row, group, isMouse) {
                var $activeRow = this.getJqueryActiveRow(),
                    activeClass = optionsModule.getClass('activeRow'),
                    selectedClass = optionsModule.getClass('selectedRow');

                $activeRow.removeClass(activeClass);
                $row.addClass(activeClass);
                if (!group) {
                    var $tbody = this.getJqueryTbody();
                    $tbody
                        .children('.' + selectedClass)
                        .removeClass(selectedClass);
                    $tbody
                        .closest('div')
                        .children('.' + optionsModule.getClass('selectedArea'))
                        .remove();
                }
                if ($row.hasClass(selectedClass) && !isMouse) {
                    $activeRow.removeClass(selectedClass);
                } else {
                    $row.toggleClass(selectedClass);
                }
                this
                    ._layoutSelectedArea($row, isMouse, $activeRow)
                    .setRowCount(this.getSelectedRows().length);
            },
            /**
             * @returns {jQuery}
             */
            getTh: function () {
                return this.getThead().children('tr').first().children('th');
            },
            /**
             * @returns {jQuery}
             */
            getThead: function () {
                return this.getJqueryDataTable().children('thead');
            },
            /**
             * @desc Get Form row class
             * @returns {string}
             */
            getRowClass: function () {
                switch (this.getModel().getFormStyleID()) {
                    case 1:
                        return '';
                    case 2:
                        return 'ch-mobile';
                    default:
                        return '';
                }
            },
            /**
             * @param {jQuery} $row
             * @param {Boolean} isMouse
             * @param {jQuery} $activeRow
             * @private
             */
            _layoutSelectedArea: function ($row, isMouse, $activeRow) {
                var model = this.getModel(),
                    id = $row.attr('data-id'),
                    $tbody = this.getJqueryTbody(),
                    selectedClass = optionsModule.getClass('selectedRow'),
                    _this = this;
                if ($row.hasClass(selectedClass)) {
                    var parentOffsetTop = $row.closest('table').offset().top,
                        left = 28,
                        width = $row.width() - left;
                    if (isMouse) {
                        var height = $row.height(),
                            top = $row.offset().top - parentOffsetTop;
                        this._createSelectedArea(width, height, left, top, id);
                    } else {
                        if (this._selectedTimerID) {
                            clearTimeout(this._selectedTimerID);
                        }
                        this._selectedTimerID = setTimeout(function () {
                            var $selectedByMouse = $tbody.children('.' + optionsModule.getClass('selectedMouseArea'));
                            if ($selectedByMouse.length) {
                                $selectedByMouse.remove();
                                $tbody.children('.' + selectedClass).removeClass(selectedClass);
                                $activeRow.addClass(selectedClass);
                                $row.addClass(selectedClass);
                            }
                            $tbody.closest('div').children('.' + optionsModule.getClass('selectedArea')).remove();
                            var $selectedRows = $tbody.children('.' + selectedClass),
                                last = $selectedRows.last().get(0),
                                height = last.offsetTop + last.offsetHeight - $selectedRows.first().get(0).offsetTop,
                                top = $selectedRows.first().offset().top - parentOffsetTop;
                            _this._createSelectedArea(width, height, left, top);
                        }, 100);

                    }
                    if (this._previewTimerID) {
                        clearTimeout(this._previewTimerID);
                    }
                    this._previewTimerID = setTimeout(function () {
                        var previewData = model.getPreview(),
                            data = model.getActualDataFromStorage(id);
                        if (previewData !== undefined) {
                            var html = [], key;
                            for (key in previewData) {
                                if (previewData.hasOwnProperty(key) && data.hasOwnProperty(key)) {
                                    html.push('<span class="footer-title">');
                                    html.push(previewData[key].caption);
                                    html.push('</span>: <span>');
                                    if (previewData[key].type === 'dt') {
                                        html.push(moment(data[key], 'MM.DD.YYYY HH:mm:ss')
                                            .format(optionsModule.getSetting('signatureFormat')));
                                    } else {
                                        html.push(data[key]);
                                    }
                                    html.push('</span><span class="footer-separator"></span>');
                                }
                            }
                            _this.$('.footer-info').html(html.join(''));
                        }
                    }, 300);
                } else {
                    var $selected = this.getJqueryDataTable().find('[rel="' + id + '"]');
                    $selected.remove();
                }
                return this;
            },
            /**
             * @desc Create area selected rows
             * @param {Number} width
             * @param {Number} height
             * @param {Number} left
             * @param {Number} top
             * @param {string} rel
             * @private
             */
            _createSelectedArea: function (width, height, left, top, rel) {
                var selAreaClasses = optionsModule.getClass('selectedArea'),
                    $selLeft = $('<div class="sel-left"></div>'),
                    $selRight = $('<div class="sel-right"></div>'),
                    $selTop = $('<div class="sel-top"></div>'),
                    $selBottom = $('<div class="sel-bottom"></div>');
                if (rel !== undefined) {
                    $selLeft.attr('rel', rel);
                    $selRight.attr('rel', rel);
                    $selTop.attr('rel', rel);
                    $selBottom.attr('rel', rel);
                    selAreaClasses += ' ' + optionsModule.getClass('selectedMouseArea');
                } else {
                    selAreaClasses += ' ' + optionsModule.getClass('selectedKeyboardArea');
                }
                $selLeft.addClass(selAreaClasses);
                $selRight.addClass(selAreaClasses);
                $selTop.addClass(selAreaClasses);
                $selBottom.addClass(selAreaClasses);

                $selLeft.css({height: height, top: top, left: left});
                $selRight.css({height: height, top: top, left: width + left});
                $selTop.css({width: width, top: top, left: left});
                $selBottom.css({width: width, top: top + height, left: left});
                this.getJqueryDataTable().parent().append($selLeft, $selRight, $selTop, $selBottom);
            },
            /**
             * @desc Set count displayed rows in table
             * @param {String} count
             * @returns {*}
             */
            setRowCount: function (count) {
                if (count) {
                    this.$('.footer-counter').text(count);
                }
                return this;
            },
            /**
             * @desc Get selected rows from table
             * @returns {jQuery[]}
             */
            getSelectedRows: function () {
                var rows = [];
                this.getJqueryDataTable().find('.row-selected').each(function () {
                    rows.push($(this));
                });
                return rows;
            },
            /**
             * @desc Remove selected rows from table
             */
            removeSelectedRows: function () {
                this.removeRows(this.getSelectedRows());
            },
            /**
             * @desc Remove rows from table
             * @param {jQuery[]} rows
             */
            removeRows: function (rows) {
                var lng = rows.length;
                if (lng) {
                    /**
                     *
                     * @type {FormChangeDTO}
                     */
                    var data = {
                        op: 'del',
                        data: []
                    };
                    for (var i = 0; i < lng; i += 1) {
                        data.data.push({id: rows[i].attr('data-id')});
                        rows[i].remove();
                    }
                    this.getModel().trigger('change:form', data);
                }
                helpersModule.leaveFocus();
            },
            /**
             * @param {String} id
             * @returns {jQuery}
             */
            getJqueryRow: function (id) {
                return this.getJqueryTbody().children('[data-id="' + id + '"]');
            },
            /**
             * @desc Handles all data change in form
             * @param {FormChangeDTO} opts
             */
            change: function (opts) {
                var operation = opts.op;
                if (['ins', 'del'].indexOf(operation) !== -1) {
                    var $dataTable = this.getJqueryDataTable();
                    $dataTable.trigger('update');
                    $dataTable.parent().find('.' + optionsModule.getClass('selectedArea')).remove();
                }

                if (['ins', 'upd'].indexOf(operation) !== -1) {
                    this.getModel().addChangeToStorage(opts.id, opts.data);
                    this.getJqueryRow(opts.id).addClass('grid-row-changed');
                }
                if (operation === 'del') {
                    var i,
                        hasOwn = Object.prototype.hasOwnProperty,
                        data = opts.data;
                    for (i in data) {
                        if (hasOwn.call(data, i)) {
                            this.getModel().addDeletedToStorage(data[i].id);
                        }
                    }
                }
                this._markAsChanged();
            },
            /**
             * @desc Mark for user, that form has unsaved change
             * @private
             */
            _markAsChanged: function(){
                this.getSaveButton().addClass('active');
            },
            /**
             * @desc Mark for user, that form has not unsaved change
             */
            markAsNoChanged: function(){
                this.getSaveButton().removeClass('active');
            },
            /**
             * @returns {jQuery}
             */
            getSaveButton: function () {
                return this.$('menu').children('.menu-button-save');
            },
            /**
             * @returns {string}
             */
            getActiveRowID: function () {
                return this.getJqueryActiveRow().attr('data-id');
            },
            /**
             * @returns {jQuery}
             */
            getJqueryActiveRow: function () {
                return this.$('.' + optionsModule.getClass('activeRow'));
            },
            /**
             * @param {jQuery} $form
             */
            layoutFooter: function ($form) {
                $form.after(this.footerTemplate());
            },
            /**
             * @desc Clear selected area in table
             * @returns {*}
             */
            clearSelectedArea: function () {
                this.getJqueryDataTable().parent().children('.sel-area').remove();
                return this;
            },
            /**
             * @desc Get column position in table
             * @param {String} key
             * @returns {Number}
             */
            getPositionColumn: function (key) {
                var settings = this.getModel().getFormSettingsFromStorage(),
                    i,
                    hasOwn = Object.prototype.hasOwnProperty,
                    obj;
                for (i in settings) {
                    if (hasOwn.call(settings, i)) {
                        obj = settings[i];
                        if (obj.key === key) {
                            return obj.weight;
                        }
                    }
                }
            },
            /**
             * @desc Initialize form settings
             */
            initSettings: function () {
                this._initColumnSettings();
                if (this.getModel().isAutoUpdate()) {
                    this.startAutoUpdate();
                }
            },
            /**
             * @desc Initialize column settings and persist his in local storage
             * @private
             */
            _initColumnSettings: function () {
                var $th = this.getTh(),
                    model = this.getModel(),
                    settings = [],
                    defaultWidth = optionsModule.getSetting('defaultColumnsWidth');

                if (model.hasSettings()) {
                    var $tr = this.getThead().children('tr'),
                        $trSorted = $('<tr/>'),
                        controlColumn = optionsModule.getSetting('controlColumn');

                    settings = model.getFormSettingsFromStorage();
                    var unsavedSettings = settings.sort(function (a, b) {
                        if (a.key === controlColumn) {
                            return -1;
                        }
                        if (b.key === controlColumn) {
                            return 1;
                        }
                        if (a.weight > b.weight) {
                            return 1;
                        } else {
                            return -1;
                        }
                    });
                    var oldKeys = [], i, hasOwn = Object.prototype.hasOwnProperty;
                    for (i in unsavedSettings) {
                        if (hasOwn.call(unsavedSettings, i)) {
                            var column = unsavedSettings[i];
                            $trSorted.append($th.filter('[data-id="' + column.key + '"]'));
                            oldKeys.push(column.key);
                        }
                    }
                    $th.each(function () {
                        var $this = $(this),
                            id = $this.attr('data-id');
                        if (oldKeys.indexOf(id) === -1) {
                            var weight = unsavedSettings.length;
                            unsavedSettings.push({
                                key: id,
                                weight: weight,
                                width: defaultWidth
                            });
                            $trSorted.append($this);
                        }
                    });
                    model.persistColumnsSettings(unsavedSettings);
                    $tr.replaceWith($trSorted);
                } else {
                    $th.each(function (i, elem) {
                        var key = $(elem).attr('data-id');
                        if (i === 0) {
                            settings[i] = {
                                key: key,
                                weight: i,
                                width: '28'
                            };
                        } else {
                            settings[i] = {
                                key: key,
                                weight: i,
                                width: defaultWidth
                            };
                        }
                    });
                    model.persistColumnsSettings(settings);
                }
            },
            /**
             * @desc Save column width in local storage
             * @param {Number} index
             * @param {Number} width
             */
            setColumnWidth: function (index, width) {
                var settings = this.getModel().getFormSettingsFromStorage();
                if (!$.isEmptyObject(settings)) {
                    settings[index].width = width;
                }
            },
            /**
             * @desc Initialize TableSorter Widget
             * @param {jQuery} $table
             */
            initTableSorterWidget: function ($table) {
                var options = {
                    headers: {
                        0: {sorter: false}
                    },
                    dateFormat: 'ddmmyyyy',
                    emptyTo: 'zero',
                    widgetOptions: {
                        filter_hideEmpty: false,
                        savePages: false
                    }
                };
                if (optionsModule.getSetting('viewsWithoutFilters').indexOf(this.getModel().getView()) === -1) {
                    options.widgets = ['filter'];
                }
                $table.tablesorter(options);
            },
            /**
             * @desc Destroy TableSorter Widget
             * @private
             */
            _destroyTableSorterWidget: function () {
                this.getJqueryFloatHeadTable().find('.tablesorter-filter').remove();
                this.getJqueryFloatHeadTable().find('th').unbind('click mousedown').remove();
                this.getJqueryFloatHeadTable()
                    .unbind('appendCache applyWidgetId applyWidgets sorton update updateCell')
                    .removeClass('tablesorter');
                this.getJqueryDataTable().find('.table-td').remove();
                this.getJqueryDataTable().find('tr').remove();

                this.getJqueryDataTable().trigger("destroy");
            },
            /**
             * @desc Save reference for fight with leak memory
             * @param {?jQuery} $elements
             * @private
             */
            _persistReferenceToResizableElements: function ($elements) {
                this._$resizableElements = $elements;
            },
            /**
             * @desc Initialize resizable widget for columns headers
             * @param {jQuery} $table
             */
            initResizeWidget: function ($table) {
                var $headers = this.getTh()
                        .filter(function (i) {
                            return i > 0;
                        }).children('div'),
                    startWidth = 0,
                    _this = this;
                this._persistReferenceToResizableElements($headers);
                $headers.each(function () {
                    var $columnResize, $bodyResize;
                    $(this).resizable({
                        handles: 'e',
                        containment: 'parent',
                        distance: 1,
                        stop: function (event, ui) {
                            try {
                                var index = ui.element.parent().get(0).cellIndex,
                                    uiWidth = ui.size.width,
                                    $fixedTable = _this.getJqueryFloatHeadTable(),
                                    $userGrid = $table.parent();

                                _this.setColumnWidth(index, uiWidth);
                                $table.children("colgroup").children("col").eq(index).width(uiWidth);
                                $fixedTable.children("colgroup").children("col").eq(index).width(uiWidth);
                                ui.element.width(uiWidth);

                                var endWidth = ui.element.width(),
                                    deltaWidth = endWidth - startWidth,
                                    selWidth = $fixedTable.get(0).offsetWidth;
                                if (deltaWidth < 0) {
                                    selWidth += deltaWidth;
                                }
                                $userGrid.find('.sel-right').css({left: selWidth});
                                $userGrid.find('.sel-bottom, .sel-top').css({width: selWidth - 28});
                                if (deltaWidth < 0) {
                                    var tableWidth = $fixedTable.get(0).offsetWidth + deltaWidth;
                                    $fixedTable.width(tableWidth);
                                    $table.width(tableWidth);
                                }
                            } catch (e) {
                                _this.publishError({view: _this, error: e});
                            } finally {
                                $columnResize.remove();
                                $bodyResize.remove();
                            }
                        },
                        resize: function (event, ui) {
                            var position = ui.element.offset();
                            $columnResize.css({left: position.left + ui.size.width});
                            $bodyResize.css({left: position.left + ui.size.width});
                        },
                        start: function (event, ui) {
                            var position = ui.element.offset(),
                                headerHeight = 24,
                                realHeight = $table.closest("div").height() - headerHeight,
                                visibleHeight = $table.height() - headerHeight;

                            $columnResize = $("<span>", {'class': "column-resize column-resize-header"})
                                .css({
                                    'top': position.top,
                                    'left': position.left
                                });
                            $bodyResize = $("<span>", {'class': "column-resize column-resize-body"})
                                .css({
                                    'top': position.top + headerHeight,
                                    'left': position.left,
                                    'height': Math.min(visibleHeight, realHeight)
                                });

                            helpersModule.getContentObj()
                                .append($columnResize)
                                .append($bodyResize);
                            startWidth = ui.element.width();
                        }
                    });
                });
            },
            /**
             * @desc Destroy resizable plugin
             * @private
             */
            _destroyResizableWidget: function () {
                if (this._$resizableElements) {
                    this._$resizableElements.resizable('destroy');
                    delete this._$resizableElements;
                }
            },
            /**
             * @desc Initialize Jquery.floatThead plugin
             * @param {jQuery} $table
             */
            initFloatTheadWidget: function ($table) {
                var $gridView = this.getJqueryGridView();
                $table.floatThead({
                    view: this,
                    scrollContainer: function () {
                        return $gridView;
                    }
                });
            },
            /**
             * @desc Destroy Jquery.floatThead plugin
             * @private
             */
            _destroyFloatTheadWidget: function () {
                this.getJqueryDataTable().find('th').remove();
                this.getJqueryDataTable().find('td').remove();
                this.getJqueryDataTable().floatThead('destroy');
            }
        });
})
(undefined, Math, jQuery, _, AbstractView, optionsModule, helpersModule, moment);