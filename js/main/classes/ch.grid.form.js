/**
 * Класс, представляющий Форму в Шоколаде на клиенте(<form>)
 */
function ChGridForm($form) {
    this.previewTimerID = null;
    this.selectedTimerID = null;
    this.refreshTimerID = null;
    this.$form = $form;
    this.ch_form_settings = new ChFormSettings(this);
    this._id = null;
    this._view_id = null;
    this._tab_caption = null;
    this._$table = null;
    this._$fixed_table = null;
    this._refresh_url = null;
    this._parent_form_id = null;
    this._ch_messages_container = null;
    this._is_ajax_add = null;
    this._$user_grid = null;
    this._user_grid_id = null;
    this._storage = null;
    this._ch_filter_form = null;
    this._$grid_form = null;
    this._parent_view = null;
    this._save_url = null;
    this._parent_pk = null;
    this._is_card_support = null;
    this._$footer = null;
    this._$thead = null;
    this._type = null;
    this._$save_btn = null;
    this.fmChildGridCollection = new FmChildGridCollection();
    this._chCardsCollection = null;
    this.priorityColorCol = [];
    this.destroy = function(){
        delete this.fmChildGridCollection;
        delete this.ch_form_settings.ch_grid_form;
        delete this.ch_form_settings;
        delete this._ch_messages_container;
        delete this._chCardsCollection;
        delete this._$fixed_table;
        delete this._$table;
        delete this.$form;
        delete this._$thead;
        delete this._$save_btn;
        delete this._$grid_form;
        delete this._$user_grid;
    }
}
//ChGridForm.TEMPLATE_TD = '<td style class="{class}{class2}"><div class="table-td table-td-3"><a data-value="{value}" data-pk ="{pk}" rel="{rel}" class="editable"></a></div></td>';
ChGridForm.TEMPLATE_TD = '<td style class="{class}{class2}"><div class="table-td"><a data-value="{value}" data-pk ="{pk}" rel="{rel}" class="editable"></a></div></td>';
ChGridForm.TEMPLATE_FIRST_TD = '<td class="grid-menu"><span class="card-button" data-id="card-button" title="Открыть карточку"></span>';
ChGridForm.prototype.getExitMessage = function () {
    return 'В форме "' + this.getTabCaption() + '" имеются несохраненные изменения. Закрыть без сохранения?'
};
ChGridForm.prototype.removeSelectedRows = function () {
    this.removeRows(this.getSelectedRows());
};
ChGridForm.prototype.LazyRefresh = function () {
    if (this.refreshTimerID) {
        clearTimeout(this.refreshTimerID);
    }
    var _this = this;
    this.refreshTimerID = setTimeout(function () {
        _this.refresh()
    }, 900)
};
ChGridForm.prototype.addPriorityColorAndApply = function (id, priority, color) {
    var priorities = this.priorityColorCol[id];
    if (typeof priorities == 'undefined') {
        this.priorityColorCol[id] = [];
    }
    this.priorityColorCol[id].push({priority: priority, color: '#' + color})
    var prColor = this._getRowColor(id);
//    if(prColor){
    this.getTable().find('tr[data-id="' + id + '"]').css({background: prColor})
//    }
};
ChGridForm.prototype.removePriorityColorAndApply = function (id, priority) {
    if (typeof this.priorityColorCol[id] != 'undefined') {

        var _this = this;
        this.priorityColorCol[id].forEach(function (item, index) {
            if (item.priority == priority) {
                delete _this.priorityColorCol[id][index];
            }
        })
    }
    var color = this._getRowColor(id);
    if (color) {
        this.getTable().find('tr[data-id="' + id + '"]').css({background: color})
    } else {
        this.getTable().find('tr[data-id="' + id + '"]').css({background: ''})
    }
};
ChGridForm.prototype._getRowColor = function (id) {
    var priorities = this.priorityColorCol[id];
    if (typeof priorities != 'undefined') {
        var color = null, prevPriority;
        priorities.forEach(function (item) {
            if (typeof prevPriority == 'undefined' || item.priority < prevPriority) {
                prevPriority = item.priority;
                color = item.color;
            }
        });
        return color;
    }
    return null;
};
ChGridForm.prototype.setDefaultValue = function (key, val) {
    this.getDefaultObj()[key] = val;
};
/**
 *
 * @returns {FmChildGridCollection}
 */
ChGridForm.prototype.getFmChildGridCollection = function () {
    return this.fmChildGridCollection
};

/**
 *
 * @param chCardsCollection {FmCardsCollection}
 */
ChGridForm.prototype.setFmCardsCollection = function (chCardsCollection) {
    this._chCardsCollection = chCardsCollection;
};
/**
 *
 * @returns {null|FmCardsCollection}
 */
ChGridForm.prototype.getFmCardsCollection = function () {
    return this._chCardsCollection;
};
ChGridForm.prototype.getThead = function () {
    if (this._$thead == null) {
        this._$thead = this.getTable().children('thead');
    }
    return this._$thead;
};
ChGridForm.prototype.getType = function () {
    if (this.type == null) {
        this._type = this.$form.children('section').attr('data-id');
    }
    return this._type;
};
ChGridForm.prototype.getTh = function () {
//    if (this._$th == null) {
       return this.getThead().children('tr').first().children('th');
//    }
//    return this._$th;
};
ChGridForm.prototype.hasSettings = function () {
    if ($.isEmptyObject(this.getSettingsObj())) {
        return false;
    }
    return true;
};
ChGridForm.prototype.setDefaultSettings = function () {
    var $th = this.getTh(), settings_obj = [];
    if (this.hasSettings()) {
        var $tr = this.getThead().children('tr'),
            $tr_sorted = $('<tr></tr>');

        settings_obj = this.getSettingsObj();
//        $
        var sorted_columns = settings_obj.sort(function (a, b) {
            if (a.key == ChOptions.keys.controlColumn) {
                return -1
            }
            if (b.key == ChOptions.keys.controlColumn) {
                return 1
            }
            if (a.weight > b.weight) {
                return 1
            } else {
                return -1
            }
        });
        $th.each(function () {

        })
        var oldKeys = [];
        for (var i in sorted_columns) {
            var column = sorted_columns[i];
            $tr_sorted.append($th.filter('[data-id="' + column.key + '"]'));
            oldKeys.push(column.key);
        }
        $th.each(function () {
            var id = $(this).attr('data-id');
            if ($.inArray(id, oldKeys) == -1) {
                var weight = sorted_columns.length;
                sorted_columns.push({
                    key: id,
                    weight: weight,
                    width: ChOptions.settings.defaultColumnsWidth
                })
                $tr_sorted.append($(this))
            }
        })
        this.setSettingsObj(sorted_columns)

        $tr.replaceWith($tr_sorted);
    } else {
        $th.each(function (i, elem) {
            if (i == 0) {
                settings_obj[i] = {
                    key: $(elem).attr('data-id'),
                    weight: i,
                    width: '28'
                };
            } else {
                settings_obj[i] = {
                    key: $(elem).attr('data-id'),
                    weight: i,
                    width: ChOptions.settings.defaultColumnsWidth
                }
            }
        })
        this.setSettingsObj(settings_obj)
    }

};
ChGridForm.prototype.getFooter = function () {
    if (this._$footer == null) {
        this._$footer = this.$form.siblings('footer');
    }
    return this._$footer;
};
ChGridForm.prototype.setSettingsObj = function (setting_obj) {
    var storage = this.getSettingsObj();
    Chocolate.storage.local.settings[this.getView()] = setting_obj
};
ChGridForm.prototype.getColumnWidth = function (index) {
    var settingObj = this.getSettingsObj();
    if ($.isEmptyObject(settingObj)) {
        this.setColumnWidth(index, ChOptions.settings.defaultColumnsWidth)
        return ChOptions.settings.defaultColumnsWidth;
    }
    return settingObj[index].width;
};
ChGridForm.prototype.setColumnWidth = function (index, width) {
    var settingObj = this.getSettingsObj();
    if (!$.isEmptyObject(settingObj)) {
        settingObj[index].width = width;
    }
};
ChGridForm.prototype.getPositionColumn = function (key) {
    var settingObj = this.getSettingsObj();
    for (var i in settingObj) {
        var obj = settingObj[i];
        if (obj.key == key) {
            return obj.weight;
        }
    }
};
ChGridForm.prototype.changeSettings = function (start_index, end_index) {
    var min_index = 1, setting = this.getSettingsObj();
    if (!$.isEmptyObject(setting)) {
        var key = this.getView(), obj, new_settings = [];
        if (start_index < end_index) {
            for (var i in setting) {
                obj = setting[i];
                if (obj.weight == 0) {
                    new_settings[0] = {key: obj.key, weight: obj.weight, width: obj.width};
                } else {
                    if (obj.weight > start_index && obj.weight <= end_index) {
                        var new_weight = obj.weight - 1;
                        new_settings[new_weight] = {key: obj.key, weight: new_weight, width: obj.width};
                    } else if (obj.weight == start_index) {
                        var new_weight = Math.max(end_index, min_index);
                        new_settings[new_weight] = {key: obj.key, weight: new_weight, width: obj.width};
                    } else {
                        new_settings[obj.weight] = {key: obj.key, weight: obj.weight, width: obj.width};
                    }
                }
            }
        }
        if (start_index > end_index) {
            for (var i in setting) {
                obj = setting[i];
                if (obj.weight == 0) {
                    new_settings[0] = {key: obj.key, weight: obj.weight, width: obj.width};
                } else {
                    if (obj.weight < start_index && obj.weight >= Math.max(end_index, min_index)) {
                        var new_weight = obj.weight + 1;
                        new_settings[new_weight] = {key: obj.key, weight: new_weight, width: obj.width};
                    } else if (obj.weight == start_index) {
                        var new_weight = Math.max(end_index, min_index);
                        new_settings[new_weight] = {key: obj.key, weight: new_weight, width: obj.width};
                    } else {
                        new_settings[obj.weight] = {key: obj.key, weight: obj.weight, width: obj.width};
                    }
                }
            }
        }
        this.setSettingsObj(new_settings)
    }
};
ChGridForm.prototype.getSettingsObj = function () {
    var storage = Chocolate.storage.local.settings,
        key = this.getView();
    if (typeof(storage[key]) == 'undefined') {
        storage[key] = {};
    }
    return storage[key];
};
ChGridForm.prototype.isCardSupport = function () {
    if (this._is_card_support == null) {
        this._is_card_support = this.$form.attr('data-card-support') == '1';
    }
    return this._is_card_support;
};
ChGridForm.prototype.getActiveRowID = function () {
    return this.getActiveRow().attr('data-id');
};
ChGridForm.prototype.isAutoOpenCard = function () {
    return this.getGridPropertiesObj()['autoOpenCard'];
};
ChGridForm.prototype.generateCardID = function (id) {
    return [ 'card_', this.getView(), id ].join('');
};
ChGridForm.prototype.openCard = function (pk) {
    if (this.isCardSupport()) {
        var view = this.getView(),
            $tabs = Chocolate.$tabs,
            uniqueID = this.generateCardID(pk),
            $a = $tabs.find('li[data-tab-id=\'' + uniqueID + '\']').children('a');
        if ($a.length == 0) {
            var viewID = this.getID(),
                caption;
            if ($.isNumeric(pk)) {
                caption = this.getTabCaption() + ' [' + pk + ']';
            } else {
                caption = this.getTabCaption() + '[новая запись]';
            }
            var tabTemplate = "<li data-tab-id=" + uniqueID + " data-id =\'" + pk + "\' data-view=\'" + view + "\' >" +
                    Chocolate.tab.createTabLink('', caption) + "</li>",
                $li = $(tabTemplate);

            ChTabHistory.push($li);
            $tabs.children('ul').append($li);
            $tabs.tabs("refresh");
            var _this = this;
            $a = $li.children('a');
            /**
             * @type {ChTab}
             */
            var chTab = ChObjectStorage.create($a, 'ChTab');

            $tabs.tabs({
                beforeLoad: function (event, ui) {
                    ui.jqXHR.abort();
                    var html = _this.getFmCardsCollection().generateTabs(view, pk, viewID);
                    ui.panel.html(html)

                }
            });

            $tabs.tabs({ active: chTab.getIndex()})
            var href = '#' + chTab.getPanelID(),
                $context = $(href)
            chApp.getDraw().drawCard($context)
            //инициализируем вложенные табы
            Chocolate.tab.card.init($context)
            $a.attr('href', href)
        } else {
            /**
             * @type {ChTab}
             */
            var chTab = ChObjectStorage.create($a, 'ChTab');
            $tabs.tabs({ active: chTab.getIndex() })
        }
    }

};
ChGridForm.prototype.getCallbackID = function () {
    return this.getUserGridID();
};
/**
 * @returns {jQuery}
 */
ChGridForm.prototype.getGridForm = function () {
    if (this._$grid_form == null) {
        this._$grid_form = this.$form.closest('section');
    }
    return this._$grid_form;
};
/**
 * @returns {String}
 */
ChGridForm.prototype.getSaveUrl = function () {
    if (this._save_url == null) {
        this._save_url = [
            chApp.getOptions().urls.formSave,
            '?view=',
            this.getView(),
            '&parentView=',
            this.getParentView(),
            '&parentID=',
            this.getParentPK()
        ].join('');
    }
    return this._save_url;
};
ChGridForm.prototype.getPreviewObj = function () {
    var storage = this.getStorage();
    return storage[this.getID()].preview;
};

/**
 *
 * @param width {int}
 * @param height {int}
 * @param left {int}
 * @param top {int}
 * @param rel {string}
 * @private
 */
ChGridForm.prototype._createSelectedArea = function (width, height, left, top, rel) {
    var selAreaClasses = ChOptions.classes.selectedArea;
    var $selLeft = $('<div class="sel-left"></div>'),
        $selRight = $('<div class="sel-right"></div>'),
        $selTop = $('<div class="sel-top"></div>'),
        $selBottom = $('<div class="sel-bottom"></div>');
    if (typeof rel != 'undefined') {
        $selLeft.attr('rel', rel);
        $selRight.attr('rel', rel);
        $selTop.attr('rel', rel);
        $selBottom.attr('rel', rel);
        selAreaClasses += ' ' + ChOptions.classes.selectedMouseArea;
    } else {
        selAreaClasses += ' ' + ChOptions.classes.selectedKeyboardArea;
    }
    $selLeft.addClass(selAreaClasses);
    $selRight.addClass(selAreaClasses);
    $selTop.addClass(selAreaClasses);
    $selBottom.addClass(selAreaClasses);

    $selLeft.css({height: height, top: top, left: left});
    $selRight.css({height: height, top: top, left: width + left});
    $selTop.css({width: width, top: top, left: left});
    $selBottom.css({width: width, top: top + height, left: left});
//    this.getTable().children('tbody').append($selLeft, $selRight, $selTop, $selBottom);
    this.getTable().parent().append($selLeft, $selRight, $selTop, $selBottom);
}
/**
 *
 * @param $row {jQuery}
 * @param isMouse {Boolean}
 * @param $activeRow {jQuery}
 */
ChGridForm.prototype.layoutSelectedArea = function ($row, isMouse, $activeRow) {
    var id = $row.attr('data-id'),
        $tbody = this.getTable().children('tbody');
//        selAreaClass = ChOptions.classes.selectedArea;
    if ($row.hasClass(ChOptions.classes.selectedRow)) {
//        console.log($row.close,  $($row.get(0).offsetParent), $row,  $($row.get(0).offsetParent).offset())
        var parentOffsetTop = $row.closest('table').offset().top,
            left = 28,
            width = $row.width() - left;
        if (isMouse) {
            var height = $row.height(), top = $row.offset().top - parentOffsetTop;
            this._createSelectedArea(width, height, left, top, id);
        } else {
            if (this.selectedTimerID) {
                clearTimeout(this.selectedTimerID);
            }
            var selectedClass = ChOptions.classes.selectedRow, _this = this;
            this.selectedTimerID = setTimeout(function () {
                var $selectedByMouse = $tbody.children('.' + ChOptions.classes.selectedMouseArea);
                if ($selectedByMouse.length) {
                    $selectedByMouse.remove();
                    $tbody.children('.' + selectedClass).removeClass(selectedClass);
                    $activeRow.addClass(selectedClass);
                    $row.addClass(selectedClass);
                }
                $tbody.closest('div').children('.' + ChOptions.classes.selectedArea).remove();
                var $selectedRows = $tbody.children('.' + ChOptions.classes.selectedRow),
                    last = $selectedRows.last().get(0),
                    height = last.offsetTop + last.offsetHeight - $selectedRows.first().get(0).offsetTop,
                    top = $selectedRows.first().offset().top - parentOffsetTop;
                _this._createSelectedArea(width, height, left, top);
            }, 100)

        }

        if (this.previewTimerID) {
            clearTimeout(this.previewTimerID);
        }
        var _this = this;
        this.previewTimerID = setTimeout(function () {
            var preview_data = _this.getPreviewObj(),
                data = Chocolate.mergeObj(_this.getDataObj()[id], _this.getChangedObj()[id]);


            if (typeof(preview_data) != 'undefined') {
                var html = '';
                for(var key in preview_data){
                    if(data.hasOwnProperty(key)){
                        html += '<span class="footer-title">';
                        html += preview_data[key]['caption'] + '</span>: <span>';
                        if(preview_data[key]['type'] == 'dt'){
                            html += moment(data[key], 'MM.DD.YYYY HH:mm:ss').format(chApp.getOptions().settings.signatureFormat);
                        }else{
                            html += data[key];
                        }
                        html += ' </span><span class="footer-separator"></span>';
                    }
                }
                _this.getGridForm().find('footer div[data-id=info]').html(html);
            }
        }, 300)
    } else {
        var $selected = this.getTable().find('[rel="' + id + '"]');
        $selected.remove();
    }
}
/**
 *
 * @param $row {jQuery}
 * @param group {Boolean}
 * @param isMouse {Boolean}
 */
ChGridForm.prototype.selectRow = function ($row, group, isMouse) {
    var $activeRow = this.getActiveRow(),
        actvClass = ChOptions.classes.activeRow,
        selctClass = ChOptions.classes.selectedRow;

    $activeRow.removeClass(actvClass);
    $row.addClass(actvClass);
    if (!group) {
        var $tbody = this.getTable().children('tbody');
        $tbody.children('.' + selctClass).removeClass(selctClass);
        $tbody.closest('div').children('.' + ChOptions.classes.selectedArea).remove();
    }
    if ($row.hasClass(selctClass) && !isMouse) {
        $activeRow.removeClass(selctClass)
    } else {
        $row.toggleClass(selctClass);
    }
    this.layoutSelectedArea($row, isMouse, $activeRow);
    this.setRowCount(this.getSelectedRows().length);
};

/**
 * @returns {String}
 */
ChGridForm.prototype.getParentView = function () {
    if (this._parent_view == null) {
        var parent_form_id = this.getParentFormID();
        if (parent_form_id) {
            this._parent_view = ChObjectStorage.create($('#' + parent_form_id), 'ChGridForm').getView();
        } else {
            this._parent_view = '';
        }
    }
    return this._parent_view;
};
/**
 * @returns {Object}
 */
ChGridForm.prototype.getStorage = function () {
    if (this._storage == null) {
        var form_id = this.getID(),
            storage = Chocolate.storage.session[form_id];
        if (typeof(storage) == 'undefined' || $.isEmptyObject(storage)) {
            Chocolate.storage.session[form_id] = new Object({data: {}, preview: {}, change: {}, deleted: {}, defaultValues: {}, required: {}});
        }
        this._storage = Chocolate.storage.session;
    }
    return this._storage;
};
ChGridForm.prototype.getRequiredObj = function () {
    var storage = this.getStorage();
    return storage[this.getID()].required;
};
ChGridForm.prototype.getDeletedObj = function () {
    var storage = this.getStorage();
    return storage[this.getID()].deleted;
};
ChGridForm.prototype.getChangedObj = function () {
    var storage = this.getStorage();
    if (typeof storage[this.getID()] == 'undefined') {
        return {};
    }
    return storage[this.getID()].change;
};
ChGridForm.prototype.isHasChange = function () {
    Chocolate.leaveFocus();
    if (this._isAttachmentsModel()) {
        return ChAttachments.isNotEmpty(this.getID()) || !$.isEmptyObject(this.getDeletedObj());
    } else {
        return !$.isEmptyObject(this.getChangedObj()) || !$.isEmptyObject(this.getDeletedObj());
    }
};
ChGridForm.prototype.getGridPropertiesObj = function () {
    var storage = this.getStorage();
    return storage[this.getID()].gridProperties;
};
ChGridForm.prototype.getDataObj = function () {
    var storage = this.getStorage();
    return storage[this.getID()].data;
};
ChGridForm.prototype.getDefaultObj = function () {
    var storage = this.getStorage();
    return storage[this.getID()].defaultValues;
};
ChGridForm.prototype._resetErrors = function () {
    this.$form.find('td.grid-error').removeClass('grid-error');
};
ChGridForm.prototype.setCorrectScroll = function($row){
    var $userGrid = this._getUserGrid(),
        leftBound = $userGrid.find('thead').height(),
        rightBound = $userGrid.height() - leftBound,
        rowTopOffset = $row.offset().top - $userGrid.offset().top;
    if (rowTopOffset < leftBound || rowTopOffset > rightBound) {
        $userGrid.scrollTop($userGrid.scrollTop() + rowTopOffset - rightBound);
    }
    $.publish(this.getLayoutSubscribeName(), false);
};
ChGridForm.prototype.save = function (refresh) {
    this._resetErrors();
    var user_grid_id = this.getUserGridID(),
        parent_view = this.getParentView(),
        parent_id = this.getParentPK(),
        ch_messages_container = this.getMessagesContainer(),
        _this = this,
        deleted_obj = $.extend({}, this.getDeletedObj());

    if (!this._isAttachmentsModel()) {
        var change_obj = this.getChangedObj(),
            data_obj = this.getDataObj(),
            response_change_obj = {};

        for (var name in change_obj) {
            if (!$.isEmptyObject(change_obj[name])) {
                if (typeof(deleted_obj[name]) == 'undefined') {
                    response_change_obj[name] = Chocolate.mergeObj(data_obj[name], change_obj[name]);
                }
            }
        }

        if (!$.isEmptyObject(response_change_obj) && !$.isEmptyObject(deleted_obj)) {
            for (var row_id in deleted_obj) {
                delete response_change_obj[row_id];
            }
        }

        for (var property in deleted_obj) {
            if (!$.isNumeric(property)) {
                delete deleted_obj[property];
            }
        }

        if (!$.isEmptyObject(response_change_obj) || !$.isEmptyObject(deleted_obj)) {
            //отсекаем изменения в уже удаленных строках, они нам не нужны
            var errors = [];
            for (var index in response_change_obj) {
                var error = this.validate(response_change_obj[index]);
                if (!$.isEmptyObject(error)) {
                    errors[index] = error;
                }
            }

            if ($.isEmptyObject(errors)) {
                var changed_data = JSON.stringify(response_change_obj),
                    deleted_data = JSON.stringify(deleted_obj),
                    url = this.getSaveUrl(),
                    data = {
                        jsonChangedData: changed_data,
                        jsonDeletedData: deleted_data
                    };

                $.post(url, data)
                    .done(function (response) {
                        var ch_response = new ChResponse(response);
                        //TODO: вроде здесь сообщения можно удалять;
//                            ch_response.sendMessage(ch_messages_container);
                        if (ch_response.isSuccess()) {
                            _this.getSaveButton().removeClass('active');
                            if (refresh) {
                                _this.refresh();
                            }
                        } else {
                            ch_response.sendMessage(ch_messages_container);
                        }
                    })
                    .fail(function (response) {
                        ch_messages_container.sendMessage('Возникла непредвиденная ошибка при сохраненнии сетки.', ChResponseStatus.ERROR);
                    });
                return [];
            } else {
                for (var pk_key in errors) {
                    for (var column_key in errors[pk_key]) {
                        this.$form.find('a[data-pk=' + pk_key + '][rel=' + user_grid_id + '_' + errors[pk_key][column_key] + ']').closest('td').addClass('grid-error')
                    }
                }
                ch_messages_container.sendMessage('Заполните обязательные поля( ошибки подсвечены в сетке).', ChResponseStatus.ERROR)
                return errors;
            }
        } else {
            if (refresh) {
                ch_messages_container.sendMessage('Данные не были изменены.', ChResponseStatus.WARNING)
            }
            return [];
        }
    } else {
        var form_id = this.getID();

        if (ChAttachments.isNotEmpty(form_id)) {
            while (ChAttachments.isNotEmpty(form_id)) {
                var dev_obj = this.getDefaultObj();
                var ownerLock = dev_obj['ownerlock'];
                var file = ChAttachments.pop(form_id);
                this.$form.fileupload({
                    formData: {FilesTypesID: 4, OwnerLock: ownerLock}
                });
                this.$form.fileupload('send', {files: file})
            }

//            if (refresh) {
//                alert('refresh')
//                this.refresh();
//            }
        }
//        }
        else {
            if (!$.isEmptyObject(deleted_obj)) {
                chFunctions.saveAttachment(this);
            } else {
                ch_messages_container.sendMessage('Данные не были изменены.', ChResponseStatus.WARNING);
            }
        }
        return [];
    }

    return false;
};
ChGridForm.prototype.validate = function (data) {
    var requiredFields = this.getRequiredObj(),
        errors = [];
    for (var field in requiredFields) {
        if (typeof(data[field]) == 'undefined' || !data[field]) {
            errors.push(field);
        }
    }
    return errors;
};
/**
 * @returns {ChFilterForm}
 */
ChGridForm.prototype.getFilterForm = function () {
    if (this._ch_filter_form == null) {
        var $form = this.getGridForm().closest('div').find('section[data-id=filters]').find('form');
        if($form.length){
            this._ch_filter_form = chApp.getFactory().getChFilterForm($form);
        }
    }
    return this._ch_filter_form;
};
ChGridForm.prototype.getParentPK = function () {
//    console.log(this.$form.attr('data-parent-pk'), this._parent_pk)
    if (this._parent_pk == null) {
        if (typeof( this.$form.attr('data-parent-pk')) != 'undefined') {
            this._parent_pk = this.$form.attr('data-parent-pk');
        } else {
            this._parent_pk = '';
        }
    }
    return this._parent_pk;
};
ChGridForm.prototype.getSearchData = function () {
    var ch_filter_form = this.getFilterForm();
//    if(!ch_filter_form.$form.length){
//        return [];
//    }
    if (typeof ch_filter_form != 'undefined') {

        try {
            var filter_data = ch_filter_form.getData();

        } catch (e) {

            filter_data = {};
        }
    } else {
        filter_data = {};
    }
    var parent_id = this.getParentPK();
    if (parent_id) {
        filter_data.ParentID = parent_id;
    }
    return filter_data;
};
ChGridForm.prototype.restoreData = function () {
    this.initData(this.getDataObj(), this.getOrderData());
};
ChGridForm.prototype.getOrderData = function () {
    var storage = this.getStorage();
    return storage[this.getID()].order;
};
ChGridForm.prototype.clearSelectedArea = function(){
    this.getTable().parent().children('.sel-area').remove();
};
ChGridForm.prototype.getLayoutSubscribeName = function(){
  return ['layout', this.getUserGridID()].join('/');
};
ChGridForm.prototype.initData = function (data, order) {
    var $table = this.getTable(), $html;
    if (this._isAttachmentsModel()) {
        var tmpl_data = {'files': data},
            content = window.tmpl('template-download', tmpl_data);
        content = content.replace(new RegExp('fade', 'g'), 'fade in');
        $html = $(content);
        $table
            .find('tbody').html($html)
            .trigger("update")
    } else {
        $html = this.generateRows(data, order);
        var $tbody = $table.find('tbody'), $tr, cacheVisible =[],
            $userGrid = this._getUserGrid(), subscribeName = this.getLayoutSubscribeName();
        $.unsubscribe(subscribeName);
        $.subscribe(subscribeName, function(e, refreshCache){
            var scrollTop =$userGrid.scrollTop();
            if(refreshCache || !$tr){
                $tr = $tbody.children('tr').filter(':not(.filtered)');
                cacheVisible = [];
            }
            var trHeight = $tr.eq(2).height();
            if(!trHeight){
                if($tr.hasClass('ch-mobile')){
                    trHeight=67;
                }else{
                    trHeight = 23;
                }
            }
            var visibleHeight = $userGrid.height(),
                startIndex = Math.max((scrollTop/trHeight^0 )- 7, 0),
                endIndex =Math.min(((scrollTop + visibleHeight)/trHeight^0) +7, $tr.length);
            $tr.filter(function(i){
                if( i>=startIndex && i <= endIndex){
                    if(cacheVisible[i]){
                        return false
                    }
                    cacheVisible[i] = 1;
                    return true;
                }
                return false;
            })
                .find('.table-td')
                .css({display: 'block'});
            $tr.filter(function(i){
                if(i<startIndex || i > endIndex){
                    if(cacheVisible[i]){
                        delete cacheVisible[i];
                        return true;
                    }
                    if(refreshCache){
                        return true;
                    }
                }
                return false;
            })
                .find('.table-td')
                .css({display: 'none'});
        });

        var prevScrollTop =0;
        $userGrid.unbind('scroll.chocolate').on('scroll.chocolate', $.debounce(150, false, function(){
            var curScrollTop =$(this).scrollTop();
            if(curScrollTop !== prevScrollTop){
                $.publish(subscribeName, false);
            }
            prevScrollTop = curScrollTop;
        }));

        $tbody.html($html);
        ChEditableCallback.fire($table, this.getCallbackID());
        $table.trigger("update");
        var _this = this;
        $table.unbind('sortEnd').unbind('filterEnd').bind('sortEnd filterEnd', function(){
          _this.clearSelectedArea();
            $.publish(subscribeName, true);
        });
        $.publish(subscribeName, true);
    }
    this.setRowCount(Object.keys(data).length);
};
ChGridForm.prototype.setRowCount = function(count){
    if(count){
        this.getFooter().children('.footer-counter').text(count)
    }
};
ChGridForm.prototype.updateData = function (data, order) {
    this.updateStorage(data, order);
    this.initData(data, order);
    delete data;
    delete order;
};
ChGridForm.prototype.clearChange = function () {
    this._clearChangedObj();
    this._clearDeletedObj();
    return this;
};
ChGridForm.prototype._clearDeletedObj = function () {
    var deletedObj = this.getDeletedObj();
    deletedObj = {};
};
ChGridForm.prototype._clearChangedObj = function () {
    if (this._isAttachmentsModel()) {
        ChAttachments.clear(this.getID());
    } else {

        var changeObj = this.getChangedObj();
        for (var name in changeObj) {
            changeObj[name] = {};
        }
    }
    this.getSaveButton().removeClass('active')
};
ChGridForm.prototype.refresh = function () {
    var url = this.getRefreshUrl(),
        parent_view = this.getParentView(),
        search_data = this.getSearchData(),
        ch_messages_container = this.getMessagesContainer(),
        _this = this;

    $.ajax({
        url: url + '&ParentView=' + parent_view,
        type: "POST",
        data: search_data,
        success: function (response, st, xhr) {
            var ch_response = new ChSearchResponse(response);
            var type = _this.getType();
            if (ch_response.isSuccess()) {
                if (type == 'map') {
                    var $map = _this.$form.children('section').children('.map');
                    /**
                     * @type {ChMap}
                     */
                    var ch_map = ChObjectStorage.create($map, 'ChMap');
                    ch_map.refreshPoints(ch_response.getData(), ch_messages_container);

                } else if (type == 'canvas') {
                    var $canvas = _this.$form.find('canvas');
                    /**
                     * @type {ChCanvas}
                     */
                    var ch_canvas = ChObjectStorage.create($canvas, 'ChCanvas');
                    var data = ch_response.getData();
                    _this.updateStorage(data, {});
                    var options = new ChCanvasOptions();
                    ch_canvas.refreshData(data, options);
                }
                else {
                    _this.updateData(ch_response.getData(), ch_response.getOrder());
                    _this._clearDeletedObj();
                    _this._clearChangedObj();
                    _this.clearSelectedArea();

                }
                var filterForm = _this.getFilterForm();
                if (filterForm && typeof filterForm != 'undefined' && filterForm.$form.length) {

                    var filters = filterForm.getAutoRefreshFiltersCol();
                    if (filters.length) {
                        //todo: сделать один общий ajax
                        filters.forEach(
                            /**
                             * @param chFilter {ChFilter}
                             */
                                function (chFilter) {
                                $.get('/majestic/filterLayout', {'name': chFilter.getKey(), view: _this.getView(), 'parentID': _this.getParentPK()}).done(function (response,st ,xhr) {
                                    var $filter = $('<li>' + response + '</li>');
                                    var selValues = chFilter.getNamesSelectedValues();
                                    chFilter.$elem.html($filter.html());
                                    selValues.forEach(function (value) {
                                        chFilter.$elem.find('[value="' + value + '"]').prop("checked", true);
                                    })
                                    delete xhr.responseText;
                                    delete xhr;
                                    delete response;

                                }).fail(function () {
                                        console.log('error')
                                    })
                            })
                    }

                }
            }
            ch_response.destroy();
            delete ch_response;
            delete response;
            delete xhr.responseText;
            delete xhr;
            chApp.getFactory().garbageCollection();

        },
        error: function (xhr, status, error) {
            ch_messages_container.sendMessage(xhr.responseText, ChResponseStatus.ERROR)
        }
    })
};
/**
 * @returns {jQuery}
 */
ChGridForm.prototype._getUserGrid = function () {
    if (this._$user_grid == null) {
        this._$user_grid = this.$form.children('section[data-id=grid]').find('div[data-id=user-grid]')
    }
    return this._$user_grid;
};
ChGridForm.prototype.getUserGridID = function () {
    if (this._user_grid_id == null) {
        this._user_grid_id = this._getUserGrid().attr('id');
    }
    return this._user_grid_id;
};
ChGridForm.prototype.getID = function () {
    if (this._id == null) {
        this._id = this.$form.attr('id');
    }
    return this._id;
};
ChGridForm.prototype.getView = function () {
    if (this._view_id == null) {
        this._view_id = this.$form.attr("data-id");
    }
    return this._view_id;
};
ChGridForm.prototype.getTabCaption = function () {
    if (this._tab_caption == null) {
        this._tab_caption = this.$form.attr('data-tab-caption');
    }
    return this._tab_caption;
};
ChGridForm.prototype.getTable = function () {
    if (this._$table == null) {
        this._$table = this._getUserGrid().find('table');
    }
    return this._$table;
};
ChGridForm.prototype.getFixedTable = function () {
    if (this._$fixed_table == null) {
        this._$fixed_table = this.$form.find('section[data-id=grid]').find('table.floatThead-table');
    }
    return this._$fixed_table;
};
ChGridForm.prototype.getRefreshUrl = function () {
    if (this._refresh_url == null) {
        this._refresh_url = chApp.getOptions().urls.formSearch + '?view=' + this.getView();
    }
    return this._refresh_url
};
ChGridForm.prototype.getSaveButton = function () {
    if (this._$save_btn == null) {
        this._$save_btn = this.$form.find('menu').children('.menu-button-save');
    }
    return this._$save_btn;
};
ChGridForm.prototype.getParentFormID = function () {
    if (this._parent_form_id == null) {
        var parent_id = this.$form.attr('data-parent-id');
        if (typeof(parent_id) == 'undefined') {
            parent_id = '';
        }
        this._parent_form_id = parent_id;
    }
    return this._parent_form_id
};
/**
 * @returns {ChMessagesContainer}
 */
ChGridForm.prototype.getMessagesContainer = function () {
    if (this._ch_messages_container == null) {
        this._ch_messages_container = ChObjectStorage.create(this.$form.find(".messages-container"), 'ChMessagesContainer');
    }
    return this._ch_messages_container;
};
ChGridForm.prototype.isAjaxAdd = function () {
    if (this._is_ajax_add == null) {
        this._is_ajax_add = this.$form.attr("data-ajax-add");
    }
    return this._is_ajax_add;
};
/**
 * Преобразует коллекцию объектов jQuery в упорядоченный список.
 * @returns {Array}
 * @private
 */
ChGridForm.prototype._getChGridColumns = function () {
    var $fixed_table = this.getFixedTable(),
        $column_headers = $fixed_table.find('thead').eq(0).find('tr').eq(0).find('th'),
        sorting_columns = [],
        count_fixed_column = 1;

    $column_headers.each(function (i) {
        if (i >= count_fixed_column) {
            var ch_column = ChObjectStorage.create($($column_headers[i]), 'ChGridColumnHeader');
            sorting_columns.push(ch_column);
        }
    })
    return sorting_columns;
};
ChGridForm.prototype._getColumnTemplates = function () {
    var columns = this._getChGridColumns(),
        templates = [];
    for (var key in columns) {
        /**
         * @type {ChGridColumnHeader}
         */
        var column = columns[key],
            column_key = column.getKey(),
            template = column.getTemplate();

        templates[column_key] = template;
    }
    return templates;
};
/**
 * Добавляет строку в таблицу и возвращает id добавленной строки;
 * @param data
 * @returns {*}
 */
ChGridForm.prototype.addRow = function (data) {
    var templates = this._getColumnTemplates(),
        $table = this.getTable();

    if (typeof data['id'] === 'undefined') {
        data['id'] = Chocolate.uniqueID();
    }
    var grid_properties = this.getGridPropertiesObj(),
        $row = $(this.generateRow(templates, data, grid_properties));
    $table
        .find('tbody').prepend($row)
        .trigger('addRows', [$row, false])
    $row.addClass('grid-row-changed');

    var row_id = data['id'],
        dataObj = this.getDataObj();
    if (dataObj === []) {
        dataObj = {};
    }
    dataObj[row_id] = jQuery.extend({}, data);
    ChEditableCallback.fire($row, this.getCallbackID());
    if (this.isAutoOpenCard()) {
        this.openCard(row_id);
    }
    return row_id;
};
ChGridForm.prototype._isAttachmentsModel = function () {
    return this.getView().indexOf(Chocolate.ATTACHMENTS_VIEW) != -1;
};
ChGridForm.prototype.generateRow = function (templates, data, gridProp) {
    var style = '',
        idClass = '',
        colorCol = gridProp.colorColumnName,
        keyColorCol = gridProp.colorKey,
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

    if (this.ch_form_settings.getGlobalStyle() == 2) {
        rowClass = 'class="ch-mobile"';
    }
    var id = data['id'],
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
        hasOwn = Object.prototype.hasOwnProperty;
    for (key in templates) {
        if (hasOwn.call(templates, key)) {
            var value = '', class2 = '',
                rel = [this.getUserGridID(), key].join('_');
            if (typeof data[key] !== 'undefined' && (key != 'id' || isNumericID )) {
                value = data[key];
                if (value) {
                    value = value.replace(/"/g, '&quot;')
                }
            }
            if (key == 'id') {
                class2 = idClass;
            }

            rowBuilder.push(
                templates[key].replace(/\{pk\}/g, id)
                    .replace(/\{rel\}/g, rel)
                    .replace(/\{value\}/g, value)
                    .replace(/\{class2\}/g, class2)
            );
        }
    }
    rowBuilder.push('</tr>');
    return rowBuilder.join('');
};
ChGridForm.prototype.generateRows = function (data, order) {
    var templates = this._getColumnTemplates(),
        grid_properties = this.getGridPropertiesObj(),
        count = 0,
        stringBuilder = [];
    var _this = this;
    order.forEach(function (key) {
        count++;
        if (count > 500) {
            return;
        }
        stringBuilder.push(_this.generateRow(templates, data[key], grid_properties));
    });
    return stringBuilder.join('');

};
ChGridForm.prototype.getSelectedRows = function () {
    var rows = [];
    this.getTable().find('.row-selected').each(function () {
        rows.push($(this));
    })
    return rows
};
ChGridForm.prototype.removeRows = function ($rows) {
    var lng = $rows.length;
    var deleted_obj = this.getDeletedObj();
    for (var i = 0; i < lng; i++) {
        deleted_obj[$rows[i].attr('data-id')] = true;
        $rows[i].remove();
    }
    this.getTable().trigger("update");
    this.getSaveButton().addClass('active');
    this.getTable().parent().find('.' + ChOptions.classes.selectedArea).remove()
    Chocolate.leaveFocus();
};
ChGridForm.prototype.removeRow = function ($table_cell) {
    var $table = this.getTable(),
        $tr = $table_cell.closest('tr'),
        id = $tr.attr('data-id'),
        deleted_obj = this.getDeletedObj();
    deleted_obj[id] = true;
    $tr.remove();
    $table.trigger("update");
    this.getSaveButton().addClass('active');
};
ChGridForm.prototype.saveInStorage = function (data, preview, default_values, required_fields, grid_properties, order) {
    var storage = this.getStorage();
    storage[this.getID()] = {data: data, preview: preview, change: {}, deleted: {}, defaultValues: default_values, required: required_fields, gridProperties: grid_properties, order: order};
};
ChGridForm.prototype.updateStorage = function (data, order) {
    var storage = this.getStorage();
    storage[this.getID()].order = order;
    storage[this.getID()].data = data;
//    storage[this.getID()].preview = preview;
    storage[this.getID()].change = {};
    storage[this.getID()].deleted = {};
};

ChGridForm.prototype.toggleColls = function (isHidden, $thList) {
    var positions = [],
        $fixedTable = this.getFixedTable(),
        $table = this.getTable(),
        tables = [$table.eq(0)[0], $fixedTable.eq(0)[0]];
    var sum = 0;
    var curWidth = $table.width();
    var newWidth;
    var _this = this;
    $thList.each(function (i) {
        positions.push($(this).get(0).cellIndex);
        sum += parseInt(_this.getColumnWidth($(this).get(0).cellIndex), 10);
    })
    if (isHidden) {
        ChTableHelper.showColsManyTables(tables, positions);
        newWidth = curWidth + sum;

    } else {
        ChTableHelper.hideColsManyTables(tables, positions)
        newWidth = curWidth - sum;
    }
    $table.width(newWidth)
    $fixedTable.width(newWidth)
    $table.floatThead('reflow');
};

ChGridForm.prototype.toggleAllCols = function () {
    var
        isHidden = this.ch_form_settings.isShortVisibleMode(),
//        hiddenClass = ChOptions.classes.hiddenAllColsTable,
        $th = this.getFixedTable().find('[' + ChOptions.classes.allowHideColumn + ']');
    this.toggleColls(isHidden, $th);
    this.ch_form_settings.setShortVisibleMode(!isHidden);
    return this;
};
ChGridForm.prototype.toggleSystemCols = function () {
    var isHidden = this.ch_form_settings.isSystemVisibleMode(),
        $th = this.getFixedTable().find('th').filter(function (index) {
            return $.inArray($(this).attr('data-id'), ChOptions.settings.systemCols) !== -1;
        });
    this.toggleColls(isHidden, $th);
    this.$form.find('.menu-button-toggle').toggleClass(chApp.getOptions().classes.menuButtonSelected)
    this.ch_form_settings.setSystemVisibleMode(!isHidden);
    return this;
};
ChGridForm.prototype.getActiveRow = function () {
    return this.getTable().find('.' + ChOptions.classes.activeRow);
};
ChGridForm.prototype.exportToExcel = function () {
    var data = {
        data: $.extend(true, this.getDataObj(), this.getChangedObj()),
        view: this.getView(),
        settings: this.getSettingsObj()
    };
    $.fileDownload(
        ChOptions.urls.export2excel,
        {
            httpMethod: "POST",
            data: {data: JSON.stringify(data)}
        }
    );
};
ChGridForm.prototype.openSettings = function () {
    var $dialog = $('<div></div>'),
        $content = $('<div class="grid-settings"></div>'),
        $autoUpdate = $('<div class="setting-item"><span class="setting-caption">Автоматические обновление данных(раз в 100 секунд)</span></div>'),
        $input = $('<input type="checkbox">'),
        $styleSettings = $('<div class="setting-item"><span class="setting-caption">Выбрать дизайн(необходимо обновить страницу, после изменения)</span></div>'),
        $styleInput = $('<select><option value="1">Стандартный</option><option value="2">Мобильный</option></select>');
    /**
     * @type {ChFormSettings}
     */
    var chFormSettings = this.ch_form_settings;
    if (chFormSettings.isAutoUpdate()) {
        $input.attr('checked', 'checked');
    }
    var styleValue = chFormSettings.getGlobalStyle();
    $styleInput.find('[value="' + styleValue + '"]').attr('selected', true);
    $styleSettings.append($styleInput);
    $autoUpdate.append($input);
    $content.append($styleSettings)
    $content.append($autoUpdate)
    $dialog.append($content)
    $dialog.dialog({
        resizable: false,
        title: 'Настройки',
        dialogClass: 'wizard-dialog',
        modal: true,
//                            height: 500,
//                            width: 700,
        buttons: {
            OK: {
                'text': 'OK',
                'class': 'wizard-active wizard-next-button',
                click: function (bt, elem) {
                    chFormSettings.setAutoUpdate($input.is(':checked'));
                    chFormSettings.setGlobalStyle(parseInt($styleInput.val(), 10));
                    $(this).dialog("close");
                    $(this).remove();
                }},
            Отмена: {
                'text': 'Отмена',
                'class': 'wizard-cancel-button',
                click: function () {
                    $(this).dialog("close");
                    $(this).remove();
                }
            }

        }
    });
    $dialog.dialog('open')
};
