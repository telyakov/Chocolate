var AbstractGridView = (function (AbstractView, $, _, optionsModule, helpersModule, undefined, moment) {
    'use strict';
    return AbstractView.extend({
        events: {
            'keydown .tablesorter': 'navigateHandler',
            'click tbody > tr': 'selectRowHandler',
            'click .menu-button-expand': 'contentExpandHandler'
        },
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
        getLayoutSubscribeName: function () {
            return ['layout', this.getJqueryGridView().attr('id')].join('/');
        },
        getJqueryGridView: function () {
            return this.$('.grid-view');
        },
        getJqueryTbody: function () {
            return this.getJqueryDataTable().children('tbody');
        },
        getJqueryDataTable: function () {
            return this.getJqueryGridView().find('table');
        },
        selectRowHandler: function (e) {
            var $this = $(e.target).closest('tr');
            this.selectRow($this, e.ctrlKey || e.shiftKey, true);
        },
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
        selectedTimerID: null,
        previewTimerID: null,
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
                    var form = _this.getChForm(),
                        previewData = form.getPreviewObj(),
                        data = helpersModule.merge(form.getDataObj()[id], form.getChangedObj()[id]);
                    if (previewData !== undefined) {
                        var html = '', key;
                        for (key in previewData) {
                            if (previewData.hasOwnProperty(key)) {
                                html += '<span class="footer-title">';
                                html += previewData[key].caption + '</span>: <span>';
                                if (previewData[key].type === 'dt') {
                                    html += moment(data[key], 'MM.DD.YYYY HH:mm:ss')
                                        .format(optionsModule.getSetting('signatureFormat'));
                                } else {
                                    html += data[key];
                                }
                                html += '</span><span class="footer-separator"></span>';
                            }
                        }
                        _this.$('.footer-info').html(html);
                    }
                }, 300);
            } else {
                var $selected = this.getJqueryDataTable().find('[rel="' + id + '"]');
                $selected.remove();
            }
            return this;
        },
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
        setRowCount: function (count) {
            if (count) {
                this.$('.footer-counter').text(count);
            }
            return this;
        },
        getSelectedRows: function () {
            var rows = [];
            this.getJqueryDataTable().find('.row-selected').each(function () {
                rows.push($(this));
            });
            return rows;
        },
        removeSelectedRows: function () {
            this.removeRows(this.getSelectedRows());
        },
        removeRows: function ($rows) {
            var lng = $rows.length;
            if (lng) {
                //var delObj = this.getChForm().getDeletedObj();
                var data = {
                    op: 'del',
                    data: []
                };
                for (var i = 0; i < lng; i++) {
                    data.data[$rows[i].attr('data-id')] = true;
                    $rows[i].remove();
                }
                this.model.trigger('change:form', data);
            }
            helpersModule.leaveFocus();
        },
        change: function(opts){
            console.log(opts);
            this.getJqueryDataTable().trigger("update");
            this.getSaveButton().addClass('active');
            this.getJqueryDataTable().parent().find('.' + optionsModule.getClass('selectedArea')).remove();

            //var operation = opts.op;
            //switch(operation){
            //    case 'del':
            //
            //        break;
            //}
        },
        getSaveButton: function () {
           return this.$('menu').children('.menu-button-save');
        },
        getActiveRowID: function () {
            return this.getJqueryActiveRow().attr('data-id');
        },
        getJqueryActiveRow: function () {
            return this.$('.' + optionsModule.getClass('activeRow'));
        },
        layoutFooter: function ($form) {
            $form.after(this.footerTemplate());
        }
    });
})
(AbstractView, jQuery, _, optionsModule, helpersModule, undefined, moment);