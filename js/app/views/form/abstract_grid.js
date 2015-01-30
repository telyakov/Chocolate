/**
 * Class AbstractGridView
 * @class
 * @augments AbstractView
 */
var AbstractGridView = (function (AbstractView, $, _, optionsModule, helpersModule, undefined, moment, storageModule) {
    'use strict';
    return AbstractView.extend(
        /** @lends AbstractGridView */
        {
            events: {
                'keydown .tablesorter': 'navigateHandler',
                'click tbody > tr': 'selectRowHandler',
                'click .menu-button-expand': 'contentExpandHandler',
                'click .form-modal-button': 'modalFormElementHandler',
                'click .menu-button-save': 'saveFormHandler',
                'click .menu-button-action': 'menuContextHandler',
                'click .menu-button-print': 'menuContextHandler'
            },
            selectedTimerID: null,
            previewTimerID: null,
            _$resizableElements: null,
            /**
             * @method destroy
             */
            destroy: function () {
                delete this.selectedTimerID;
                delete this.previewTimerID;
                this.undelegateEvents();
                this._destroyResizableWidget();
                this._destroyTableSorterWidget();
                this._destroyFloatTheadWidget();
                AbstractView.prototype.destroy.apply(this);

            },
            /**
             * @param e {Event}
             */
            menuContextHandler: function (e) {
                var $this = $(e.target).closest('button');
                $this.contextmenu('open', $this);
            },
            /**
             * @method save
             */
            saveFormHandler: function () {
                this.model.trigger('save:form', {
                    refresh: true
                });
            },
            /**
             *
             * @param e {Event}
             * @returns {boolean}
             */
            modalFormElementHandler: function (e) {
                var $this = $(e.target),
                    key = $this.attr('data-name'),
                    pk = $this.closest('tr').attr('data-id'),
                    model = this.model.getColumnsROCollection().findWhere({
                        key: key
                    }),
                    $elem = $this.prevAll('a'),
                    _this = this,
                    isAllowEdit = model.isAllowEdit(this, pk),
                    caption = model.getVisibleCaption(),
                    isMarkupSupport = !!model.getColumnCustomProperties().get('markupSupport'),
                    $cell = $elem.parent(),
                    $popupControl = $('<a/>', {
                        'class': 'grid-textarea'
                    });
                helpersModule.leaveFocus();
                $popupControl.appendTo($cell.closest('section'));
                if (isMarkupSupport) {
                    helpersModule.wysiHtmlInit($popupControl, helpersModule.createTitleHtml(pk, caption));
                } else {
                    $popupControl.editable({
                        type: 'textarea',
                        mode: 'popup',
                        onblur: 'ignore',
                        savenochange: false,
                        title: helpersModule.createTitleHtml(pk, caption)
                    });
                }
                if (isAllowEdit) {
                    $popupControl
                        .on('save', function saveHandler(e, params) {
                            if (params.newValue !== undefined) {
                                var data = {};
                                data[key] = params.newValue;
                                _this.model.trigger('change:form', {
                                    op: 'upd',
                                    id: pk,
                                    data: data
                                });
                                $elem.editable('setValue', params.newValue);
                                $popupControl.empty();
                            }
                        }
                    );
                }
                $popupControl
                    .on('hide', function () {
                        $(this).remove();
                    });

                var value = $elem.editable('getValue')[key];
                if (typeof value !== 'string') {
                    value = value.toString();
                }
                if (isMarkupSupport) {
                    value = helpersModule.newLineSymbolsToBr(value);
                }
                $popupControl
                    .editable('setValue', value)
                    .editable('show');
                var $textArea = $popupControl.next('div').find('textarea');
                if (!isAllowEdit) {
                    $textArea.attr('readonly', true);
                } else if (isMarkupSupport) {
                    var editor = new wysihtml5.Editor($textArea.get(0)), eventData = {};
                    editor.on('load', function () {
                        $textArea.siblings('iframe').eq(1).contents().find('body')
                            .on('keydown', eventData, helpersModule.addSignToIframe)
                            .on('keydown', function (e) {
                                if (e.keyCode === optionsModule.getKeyCode('escape')) {
                                    $popupControl.editable('hide');
                                }
                            });
                    });
                }
                return false;
            },
            /**
             * @returns {boolean}
             */
            isSystemColumnsMode: function () {
                var key = this.model.getView();
                if (storageModule.hasSetting(key, 'globalStyle')) {
                    return storageModule.getSettingByKey(key, 'systemVisibleMode');
                } else {
                    return false;
                }
            },
            /**
             * @param val {Boolean}
             * @returns {*}
             */
            persistSystemColumnsMode: function (val) {
                storageModule.persistSetting(this.model.getView(), 'systemVisibleMode', val);
                return this;
            },
            /**
             * @param e {Event}
             * @returns {boolean}
             */
            navigateHandler: function (e) {
                if (['TABLE', 'SPAN'].indexOf(e.target.tagName) !== -1) {
                    //span for ie fix
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
             * @param $row {jQuery}
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
                return ['layout', this.getJqueryGridView().attr('id')].join('/');
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
             * @param index {Number}
             * @returns {Number}
             */
            getColumnWidth: function (index) {
                var settings = this.getFormSettingsFromStorage();
                if ($.isEmptyObject(settings)) {
                    var defaultWidth = optionsModule.getSetting('defaultColumnsWidth');
                    this.setColumnWidth(index, defaultWidth);
                    return defaultWidth;
                }
                return settings[index].width;
            },
            /**
             * @param e {Event}
             */
            selectRowHandler: function (e) {
                var $this = $(e.target).closest('tr');
                this.selectRow($this, e.ctrlKey || e.shiftKey, true);
            },
            /**
             * @param $row {jQuery}
             * @param group {Boolean}
             * @param isMouse {Boolean}
             */
            selectRow: function ($row, group, isMouse) {
                var $activeRow = this.getJqueryActiveRow(),
                    activeClass = optionsModule.getClass('activeRow'),
                    selectedClass = optionsModule.getClass('selectedRow');

                $activeRow.removeClass(activeClass);
                $row.addClass(activeClass);
                if (!group) {
                    var $tbody = this.getJqueryTbody();
                    $tbody.children('.' + selectedClass).removeClass(selectedClass);
                    $tbody.closest('div').children('.' + optionsModule.getClass('selectedArea')).remove();
                }
                if ($row.hasClass(selectedClass) && !isMouse) {
                    $activeRow.removeClass(selectedClass);
                } else {
                    $row.toggleClass(selectedClass);
                }
                this
                    .layoutSelectedArea($row, isMouse, $activeRow)
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
             * @returns {string}
             */
            getRowClass: function () {
                switch (this.getFormStyleID()) {
                    case 1:
                        return '';
                    case 2:
                        return 'ch-mobile';
                    default:
                        return '';
                }
            },
            /**
             * @param $row {jQuery}
             * @param isMouse {Boolean}
             * @param $activeRow {jQuery}
             */
            layoutSelectedArea: function ($row, isMouse, $activeRow) {
                var id = $row.attr('data-id'),
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
                        this.createSelectedArea(width, height, left, top, id);
                    } else {
                        if (this.selectedTimerID) {
                            clearTimeout(this.selectedTimerID);
                        }
                        this.selectedTimerID = setTimeout(function () {
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
                            _this.createSelectedArea(width, height, left, top);
                        }, 100);

                    }
                    if (this.previewTimerID) {
                        clearTimeout(this.previewTimerID);
                    }
                    this.previewTimerID = setTimeout(function () {
                        var previewData = _this.model.getPreview(),
                            data = _this.getActualDataFromStorage(id);
                        if (previewData !== undefined) {
                            var html = [], key;
                            for (key in previewData) {
                                if (data.hasOwnProperty(key)) {
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
             * @param width {Number}
             * @param height {Number}
             * @param left {Number}
             * @param top {Number}
             * @param rel {string}
             */
            createSelectedArea: function (width, height, left, top, rel) {
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
             * @param count {String}
             * @returns {*}
             */
            setRowCount: function (count) {
                if (count) {
                    this.$('.footer-counter').text(count);
                }
                return this;
            },
            /**
             * @returns {Array}
             */
            getSelectedRows: function () {
                var rows = [];
                this.getJqueryDataTable().find('.row-selected').each(function () {
                    rows.push($(this));
                });
                return rows;
            },
            /**
             * @method removeSelectedRows
             */
            removeSelectedRows: function () {
                this.removeRows(this.getSelectedRows());
            },
            /**
             * @param rows {Array}
             */
            removeRows: function (rows) {
                var lng = rows.length;
                if (lng) {
                    var data = {
                        op: 'del',
                        data: []
                    };
                    for (var i = 0; i < lng; i += 1) {
                        data.data.push({id: rows[i].attr('data-id')});
                        rows[i].remove();
                    }
                    this.model.trigger('change:form', data);
                }
                helpersModule.leaveFocus();
            },
            /**
             * @param id {String}
             * @returns {jQuery}
             */
            getJqueryRow: function (id) {
                return this.getJqueryTbody().children('[data-id="' + id + '"]');
            },
            /**
             * @param opts {Object}
             */
            change: function (opts) {
                var operation = opts.op;
                if (['ins', 'del'].indexOf(operation) !== -1) {
                    this.getJqueryDataTable().trigger('update');
                    this.getJqueryDataTable().parent().find('.' + optionsModule.getClass('selectedArea')).remove();
                }
                if (['ins', 'upd'].indexOf(operation) !== -1) {
                    this.addChangeToStorage(opts.id, opts.data);
                    this.getJqueryRow(opts.id).addClass('grid-row-changed');
                }
                if (operation === 'del') {
                    var i,
                        hasOwn = Object.prototype.hasOwnProperty,
                        data = opts.data;
                    for (i in data) {
                        if (hasOwn.call(data, i)) {
                            this.addDeletedToStorage(data[i].id);
                        }
                    }
                }
                this.getSaveButton().addClass('active');
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
             * @param $form {jQuery}
             */
            layoutFooter: function ($form) {
                $form.after(this.footerTemplate());
            },
            /**
             * @returns {*}
             */
            clearSelectedArea: function () {
                this.getJqueryDataTable().parent().children('.sel-area').remove();
                return this;
            },
            /**
             * @param key {String}
             * @returns {Number}
             */
            getPositionColumn: function (key) {
                var settings = this.getFormSettingsFromStorage(),
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
             * @method initSettings
             */
            initSettings: function () {
                this.setDefaultSettings();
                if (this.isAutoUpdate()) {
                    this.startAutoUpdate();
                }
            },
            /**
             * @method setDefaultSettings
             */
            setDefaultSettings: function () {
                var $th = this.getTh(),
                    settings = [],
                    defaultWidth = optionsModule.getSetting('defaultColumnsWidth');
                if (this.hasSettings()) {
                    var $tr = this.getThead().children('tr'),
                        $trSorted = $('<tr/>'),
                        controlColumn = optionsModule.getSetting('controlColumn');
                    settings = this.getFormSettingsFromStorage();
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
                    this.persistColumnsSettings(unsavedSettings);
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
                    this.persistColumnsSettings(settings);
                }
            },
            /**
             * @param index {Number}
             * @param width {Number}
             */
            setColumnWidth: function (index, width) {
                var settings = this.getFormSettingsFromStorage();
                if (!$.isEmptyObject(settings)) {
                    settings[index].width = width;
                }
            },
            /**
             * @param $table {jQuery}
             */
            initTableSorter: function ($table) {
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
                if (optionsModule.getSetting('viewsWithoutFilters').indexOf(this.model.getView()) === -1) {
                    options.widgets = ['filter'];
                }
                $table.tablesorter(options);
            },
            /**
             * @method destroyTableSorterWidget
             * @private
             */
            _destroyTableSorterWidget: function () {
                this.getJqueryFloatHeadTable().find('.tablesorter-filter').remove();
                this.getJqueryFloatHeadTable().find('th').unbind('click mousedown').remove();
                this.getJqueryFloatHeadTable().unbind('appendCache applyWidgetId applyWidgets sorton update updateCell')
                    .removeClass('tablesorter');
                this.getJqueryDataTable().find('.table-td').remove();
                //this.getJqueryDataTable().find('tr').remove();

                this.getJqueryDataTable().trigger("destroy");
            },
            /**
             * @param $elements {jQuery|null}
             * @private
             */
            _persistLinkToResizableElements: function ($elements) {
                this._$resizableElements = $elements;
            },
            /**
             * @param $table {jQuery}
             */
            initResize: function ($table) {
                var $headers = this.getTh()
                        .filter(function (i) {
                            return i > 0;
                        }).children('div'),
                    startWidth = 0,
                    _this = this;
                this._persistLinkToResizableElements($headers);
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
                                mediator.publish(optionsModule.getChannel('logError'),
                                    {
                                        view: _this,
                                        error: e
                                    }
                                );
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

                            helpersModule.getContentObj().append($columnResize).append($bodyResize);
                            startWidth = ui.element.width();
                        }
                    });
                });
            },
            /**
             * @method destroyTableSorterWidget
             * * @private
             */
            _destroyResizableWidget: function () {
                if(this._$resizableElements){
                    this._$resizableElements.resizable('destroy');
                    delete this._$resizableElements;
                }
            },
            /**
             * @param $table {jQuery}
             */
            initFloatThead: function ($table) {
                var _this = this;
                $table.floatThead({
                    view: this,
                    scrollContainer: function () {
                        return _this.getJqueryGridView();
                    }
                });
            },
            /**
             * @method _destroyFloatTheadWidget
             * @private
             */
            _destroyFloatTheadWidget: function () {
                this.getJqueryDataTable().floatThead('destroy');
            }
        });
})
(AbstractView, jQuery, _, optionsModule, helpersModule, undefined, moment, storageModule);