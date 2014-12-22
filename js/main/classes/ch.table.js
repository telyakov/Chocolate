function ChTable($table) {
    this.$table = $table;
    /**
     * @type {ChGridForm}
     */
    this.ch_form = facade.getFactoryModule().makeChGridForm($table.closest('form'));
}
ChTable.prototype._initTableSorter = function () {
    var options = {
        headers: {
            0: { sorter: false}
        },
        dateFormat: 'ddmmyyyy' ,
        emptyTo: 'zero',
        widgetOptions: {
            filter_hideEmpty: false,
            savePages: false
        }
    };
    //todo: перенести в настройки арбуза
    if(this.ch_form.getView() !=='tasks/tasksfortops.xml' && this.ch_form.getView() !== 'attachments.xml' && this.ch_form.getView() !=='framework/attachments/attachments.xml'){
        options.widgets =  ["filter"];
    }
    this.$table.tablesorter(options);
};
ChTable.prototype._initResize = function () {
    var $table = this.$table,
        $headers = this.ch_form.getTh().filter(function (i) {
            return i > 0;
        }).children('div'),
        start_width = 0,
        ch_form =facade.getFactoryModule().makeChGridForm($table.closest('form'));

    $headers.each(function (i) {
        var $column_resize, $body_resize;
        $(this).resizable({
            handles: 'e',
            containment: "parent",
            distance: 1,
            stop: function (event, ui) {
                try {
                    var index = ui.element.parent().get(0).cellIndex,
                        ui_width = ui.size.width,
                        $fixed_table = ch_form.getFixedTable();

                    ch_form.setColumnWidth(index, ui_width);
                    var $userGrid = $table.parent();
                    $table.children("colgroup").children("col").eq(index).width(ui_width);
                    $fixed_table.children("colgroup").children("col").eq(index).width(ui_width);
                    ui.element.width(ui_width);

                    var end_width = ui.element.width(),
                        delta_width = end_width - start_width;

                    var selWidth = $fixed_table.get(0).offsetWidth;
                    if(delta_width<0){
                         selWidth += delta_width;
                    }
                    $userGrid.find('.sel-right').css({left: selWidth});
                    $userGrid.find('.sel-bottom, .sel-top').css({width: selWidth -28 });
                    if (delta_width < 0) {
                        var table_width = $fixed_table.get(0).offsetWidth + delta_width;
                        $fixed_table.width(table_width);
                        $table.width(table_width);
                    }
                } catch (e) {
                    console.log(e);
                } finally {
                    $column_resize.remove();
                    $body_resize.remove();
                }
            },
            resize: function (event, ui) {
                var position = ui.element.offset();
                $column_resize.css({ left: position.left + ui.size.width});
                $body_resize.css({ left: position.left + ui.size.width});
            },
            start: function (event, ui) {
                var position = ui.element.offset(),
                    header_height = 24,
                    real_height = $table.closest("div").height() - header_height,
                    visible_height = $table.height() - header_height;

                $column_resize = $("<span>", { 'class': "column-resize column-resize-header"})
                    .css({
                        'top': position.top,
                        'left': position.left
                    });
                $body_resize = $("<span>", { 'class': "column-resize column-resize-body"})
                    .css({
                        'top': position.top + header_height,
                        'left': position.left,
                        'height': Math.min(visible_height, real_height)
                    });

                Chocolate.$content.append($column_resize).append($body_resize);
                start_width = ui.element.width();
            }
        });
    });
};

ChTable.prototype._initFloatThead = function () {
    var _this = this;
    _this.$table.floatThead({
        scrollContainer: function ($table) {
            return _this.ch_form._getUserGrid();
        }
    });


};
//ChTable.prototype._initData = function () {
//
//    //this.ch_form.restoreData();
//};
ChTable.prototype._initSettings = function () {
    //this.ch_form.setDefaultSettings();
    if (this.ch_form.chFormSettings.isAutoUpdate()) {
        this.ch_form.chFormSettings.startAutoUpdate();
    }

};
ChTable.prototype._initContextMenu = function () {
    var $fixed_table = this.ch_form.getFixedTable(),
        $th = $fixed_table.children('thead').find('th'),
        $sorted_th = $th.filter(function (i) {
            return i > 0;
        }),
        _this = this,
        count = Object.keys(this.ch_form.getSettingsObj()).length -1,
        realCount = $th.length - 1,
        tables = [_this.$table.eq(0)[0], $fixed_table.eq(0)[0]];
    $sorted_th.contextmenu({
        show: { effect: "blind", duration: 0 },
        menu: [
            {title: '< Сделать первой', cmd: 'to-first'},
            {title: 'Сделать последней >', cmd: 'to-last'},
            {title: 'Все колонки', cmd: 'toggle-cols'}
//                {title: 'Скрыть колонку', cmd:'hide-col'}
        ],
        select: function (event, ui) {
            var fromReal = ui.target.closest('th').get(0).cellIndex;
            var from = _this.ch_form.getPositionColumn( ui.target.closest('th').attr('data-id'));
            switch (ui.cmd) {
                case 'to-first':
                    facade.getTableModule().swapTableCols(tables, fromReal, 1);
                    _this.$table.floatThead('reflow');
                    _this.ch_form.changeSettings(from, 1);
                    break;
                case 'to-last':
                    facade.getTableModule().swapTableCols(tables, fromReal, realCount);
                    _this.$table.floatThead('reflow');
                    _this.ch_form.changeSettings(from, count);
                    break;
//                    case 'hide-col':
//                        ChTableHelper.hideColsManyTables(tables, [from]);
//                        break;
                case 'toggle-cols':
                    _this.ch_form.toggleAllCols().clearSelectedArea();
                    break;
                default :
//                        alert('неизвестная команда')
                    break;
            }
        }
    });
};
ChTable.prototype._initDragtable = function () {
    this.ch_form.getFixedTable().dragtable();
};
ChTable.prototype.initScript = function () {
    this._initSettings();
    this._initTableSorter();
    this._initResize();
    this._initFloatThead();
    this._initContextMenu();
    this._initDragtable();
    var _this = this;
    if(_this.ch_form.chFormSettings.isShortVisibleMode()){
        var $th = this.ch_form.getFixedTable().find('[' + ChOptions.classes.allowHideColumn + ']');
        _this.ch_form.toggleColls(false, $th);
    }
    if(_this.ch_form.chFormSettings.isSystemVisibleMode()){
        var $th2 = _this.ch_form.getFixedTable().find('th').filter(function (index) {
            return $.inArray($(this).attr('data-id'), ChOptions.settings.systemCols) !== -1;
        });
        _this.ch_form.toggleColls(false, $th2);
    }
};
ChTable.prototype.initAttachmentScript = function () {
    this._initSettings();
    this._initTableSorter();
    this._initResize();
    this._initFloatThead();
//    this._initContextMenu();
//    this._initDragtable();
};
