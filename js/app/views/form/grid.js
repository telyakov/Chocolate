var GridView = (function (Backbone) {
    'use strict';
    return AbstractView.extend({
        _formID: null,
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
        events: {
            'keydown .tablesorter': function (e) {
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
                        var form = facade.getFactoryModule().makeChGridForm($(e.target).closest('form')),
                            $activeRow,
                            $nextRow;

                        if (keyCode === op.getKeyCode('del')) {
                            form.removeRows(form.getSelectedRows());
                        } else if ((e.ctrlKey || e.shiftKey) && [op.getKeyCode('up'), op.getKeyCode('down')].indexOf(keyCode) !== -1) {
                            $activeRow = form.getActiveRow();
                            if (keyCode === op.getKeyCode('down')) {
                                $nextRow = $activeRow.next('tr');
                            } else {
                                $nextRow = $activeRow.prev('tr');
                            }
                            if ($nextRow.length) {
                                form.setCorrectScroll($nextRow);
                                form.selectRow($nextRow, true, false);
                            }
                        } else if ([op.getKeyCode('up'), op.getKeyCode('down')].indexOf(keyCode) !== -1) {
                            $activeRow = form.getActiveRow();
                            if (keyCode === op.getKeyCode('up')) {
                                $nextRow = $activeRow.prev('tr');
                            } else {
                                $nextRow = $activeRow.next('tr');
                            }
                            if ($nextRow.length) {
                                form.setCorrectScroll($nextRow);
                                form.selectRow($nextRow, false, false);
                            }
                        }
                        return false;
                    }
                }
                return true;


            },
            'click tbody > tr': function(e){
                var $this = $(e.target).closest('tr'),
                    form = facade.getFactoryModule().makeChGridForm($this.closest('form'));
                form.selectRow($this, e.ctrlKey || e.shiftKey, true);
            },
            'touchmove .card-button': 'openCard',
            'dblclick .card-button': 'openCard'
        },
        generateCardID: function(id){
            return [ 'card_', this.model.getView(), id ].join('');
        },
        openCard: function(e){
            if(this.model.hasCard()){
                var $this = $(e.target),
                    pk = $this.closest('tr').attr("data-id"),
                    view = this.model.getView(),
                    $tabs = $('#tabs'),
                    cardID = this.generateCardID(pk),
                    $a = $tabs.find("li[data-tab-id='" + cardID + "']").children('a'),
                    tab;
                if ($a.length === 0) {
                    var viewID = this.getFormID(),
                        caption = this.model.getCardTabCaption();
                    if ($.isNumeric(pk)) {
                        caption += ' [' + pk + ']';
                    } else {
                        caption += '[новая запись]';
                    }
                    var $li = $('<li/>', {
                        'data-tab-id': cardID,
                        'data-id': pk,
                        'data-view': view,
                        'html': facade.getTabsModule().createTabLink('', caption)
                    });
                    facade.getTabsModule().push($li);
                    $tabs.children('ul').append($li);
                    $tabs.tabs("refresh");
                    var _this = this;
                    var cardView =  new CardView({
                        model: _this.model,
                        id: pk
                    });
                    $tabs.tabs({
                        beforeLoad: function (event, ui) {
                            ui.jqXHR.abort();
                            cardView.render(view, pk, viewID, ui.panel);
                        }
                    });

                    $a = $li.children('a');
                    tab = facade.getFactoryModule().makeChTab($a);
                    $tabs.tabs({ active: tab.getIndex()});
                    var href = '#' + tab.getPanelID(),
                        $context = $(href);
                    facade.getRepaintModule().reflowCard($context);
                    cardView.initScripts($context);
                    $a.attr('href', href);
                } else {
                    console.log('elese')
                    tab = facade.getFactoryModule().makeChTab($a);
                    $tabs.tabs({ active: tab.getIndex() });
                }

            }
        },
        columnHeaderTemplate: _.template([
                '<div><a><span class="<%= class %>"></span>',
                '<span class="grid-caption">',
                '<%= caption%>',
                '</span><span class="grid-sorting"></span>',
                '</a></div>'
            ].join('')
        ),
        getFormID: function () {
            if (this._formID === null) {
                this._formID = helpersModule.uniqueID();
            }
            return this._formID;
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
            this.initData();

            //var url = this.getRefreshUrl(),
            //    parentView = parentView? parentView :this.getParentView(),
            //    searchData = this.getSearchData(),
            //    chMessagesContainer = this.getMessagesContainer(),
            //    _this = this;
            //console.log(parentView, searchData)
            //$.ajax({
            //    url: url + '&ParentView=' + parentView,
            //    type: "POST",
            //    data: searchData,
            //    success: function (response, st, xhr) {
            //        var chResponse = new ChSearchResponse(response);
            //        var type = _this.getType();
            //        if (chResponse.isSuccess()) {
            //            if (type == 'map') {
            //                var $map = _this.$form.children('section').children('.map');
            //                var ch_map = facade.getFactoryModule().makeChMap($map);
            //                ch_map.refreshPoints(chResponse.getData(), chMessagesContainer);
            //
            //            } else if (type == 'canvas') {
            //                var $canvas = _this.$form.find('canvas');
            //                var ch_canvas = facade.getFactoryModule().makeChCanvas($canvas);
            //                var data = chResponse.getData();
            //                _this.updateStorage(data, {});
            //                var options = new ChCanvasOptions();
            //                ch_canvas.refreshData(data, options);
            //            }
            //            else {
            //                _this.updateData(chResponse.getData(), chResponse.getOrder());
            //                _this._clearDeletedObj();
            //                _this._clearChangedObj();
            //                _this.clearSelectedArea();
            //
            //            }
            //            var filterForm = _this.getFilterForm();
            //            if (filterForm && typeof filterForm != 'undefined' && filterForm.$form.length) {
            //
            //                var filters = filterForm.getAutoRefreshFiltersCol();
            //                if (filters.length) {
            //                    //todo: сделать один общий ajax
            //                    filters.forEach(
            //                        /**
            //                         * @param chFilter {ChFilter}
            //                         */
            //                            function (chFilter) {
            //                            $.get('/majestic/filterLayout', {'name': chFilter.getKey(), view: _this.getView(), 'parentID': _this.getParentPK()}).done(function (response, st, xhr) {
            //                                var $filter = $('<li>' + response + '</li>');
            //                                var selValues = chFilter.getNamesSelectedValues();
            //                                chFilter.$elem.html($filter.html());
            //                                selValues.forEach(function (value) {
            //                                    chFilter.$elem.find('[value="' + value + '"]').prop("checked", true);
            //                                })
            //                                delete xhr.responseText;
            //                                delete xhr;
            //                                delete response;
            //
            //                            }).fail(function () {
            //                                console.log('error')
            //                            })
            //                        })
            //                }
            //
            //            }
            //        }
            //        chResponse.destroy();
            //        delete chResponse;
            //        delete response;
            //        delete xhr.responseText;
            //        delete xhr;
            //        facade.getFactoryModule().garbageCollection();
            //
            //    },
            //    error: function (xhr, st, er) {
            //        chMessagesContainer.sendMessage(er, ChResponseStatus.ERROR)
            //    }
            //})


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
        getSortedColumns: function () {
            var sortedColumnCollection = [],
                form = factoryModule.makeChGridForm($('#' + this.getFormID())),
                hasSetting = form.hasSettings(),
                iterator = 1;
            this.model.getColumnsROCollection().each(function (column) {
                if (!hasSetting) {
                    iterator++;
                }
                var index = hasSetting ? form.getPositionColumn(column.get('key')) : iterator - 1;
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
            this.initData();


        },
        initTableScript: function ($table) {
            facade.getFactoryModule().makeChTable($table).initScript();
        },
        initData: function () {
            var form = factoryModule.makeChGridForm($('#' + this.getFormID())),
                sortedColumnCollection = this.getSortedColumns(),
                callbacks = this.getCallbacks(),
                defer = deferredModule.create(),
                deferID = deferredModule.save(defer),
                model = this.model,
                _this = this;
            var data = this.view.getFilterData();
            model.readProcEval(deferID, data);
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
                    _this.refreshDone(data, callbacks, sortedColumnCollection, form);
                });
            });
        },
        refreshDone: function (data, callbacks, sortedColumnCollection, form) {
            var order = data.order,
                recordset = data.data;
            form.saveInStorage(recordset,this.model.getPreview(), {}, {}, {}, order);

            var html = this.generateRows(recordset, order, sortedColumnCollection, form);

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

            var key, _this = this;
            columns.forEach(function (item) {
                key = item.get('key');
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