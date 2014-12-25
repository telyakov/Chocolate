function ChGridForm($form) {
    this.$form = $form;
    this._$table = null;
    this._$fixed_table = null;
    this._parent_form_id = null;
    this._ch_messages_container = null;
    this._$user_grid = null;
    this._user_grid_id = null;
    this.storage = null;
    this._$grid_form = null;
    this._parent_view = null;
    this._save_url = null;
    this._$thead = null;
    this._type = null;
    this._$save_btn = null;
    this._chCardsCollection = null;
}
ChGridForm.prototype.destroy = function () {
    this.getTh().find('.ui-resizable').resizable('destroy');
    this.getTable().trigger("destroy");
    this.getTable().floatThead('destroy');
    facade.getFormModule().removeCallbacks(this.getCallbackID());
    delete Chocolate.storage.session[this.getID()];
    delete this._ch_messages_container;
    delete this._chCardsCollection;
    delete this._$fixed_table;
    delete this._$table;
    delete this.$form;
    delete this._$thead;
    delete this._$save_btn;
    delete this._$grid_form;
    delete this._$user_grid;
};
ChGridForm.prototype.getExitMessage = function () {
    return 'В форме "' + this.getTabCaption() + '" имеются несохраненные изменения. Закрыть без сохранения?';
};
ChGridForm.prototype.setDefaultValue = function (key, val) {
    this.getDefaultObj()[key] = val;
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
    return this.getThead().children('tr').first().children('th');
};
ChGridForm.prototype.setSettingsObj = function (setting_obj) {
    var storage = this.getSettingsObj();
    Chocolate.storage.local.settings[this.getView()] = setting_obj
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
        this.setSettingsObj(new_settings);
    }
};
ChGridForm.prototype.getSettingsObj = function () {
    var storage = Chocolate.storage.local.settings,
        key = this.getView();
    if (typeof storage[key]  === 'undefined') {
        storage[key] = {};
    }
    return storage[key];
};
ChGridForm.prototype.getEntityTypeID = function () {
    if(typeof this.getGridPropertiesObj() === 'undefined'){
        return '';
    }
    return this.getGridPropertiesObj().entityTypeID;
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
    if (this._save_url === null) {
        this._save_url = [
            optionsModule.getUrl('formSave'),
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
/**
 * @returns {String}
 */
ChGridForm.prototype.getParentView = function () {
    if (this._parent_view == null) {
        var parent_form_id = this.getParentFormID();
        if (parent_form_id) {
            this._parent_view = facade.getFactoryModule().makeChGridForm($('#' + parent_form_id)).getView();
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
    if (this.storage == null) {
        var form_id = this.getID(),
            storage = Chocolate.storage.session[form_id];
        if (typeof(storage) == 'undefined' || $.isEmptyObject(storage)) {
            Chocolate.storage.session[form_id] = new Object({data: {}, preview: {}, change: {}, deleted: {}, defaultValues: {}, required: {}});
        }
        this.storage = Chocolate.storage.session;
    }
    return this.storage;
};
ChGridForm.prototype.getRequiredObj = function () {
    //todo: migrate
    var storage = this.getStorage();
    return storage[this.getID()].required;
};
ChGridForm.prototype.getDeletedObj = function () {
    //todo: migrate
    var storage = this.getStorage();
    return storage[this.getID()].deleted;
};
ChGridForm.prototype.getChangedObj = function () {
    //todo: migrate
    var storage = this.getStorage();
    if (typeof storage[this.getID()] == 'undefined') {
        return {};
    }
    return storage[this.getID()].change;
};
ChGridForm.prototype.isHasChange = function () {
    Chocolate.leaveFocus();
    if (this._isAttachmentsModel()) {
        return facade.getFilesModule().isNotEmpty(this.getID()) || !$.isEmptyObject(this.getDeletedObj());
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
ChGridForm.prototype.save = function (refresh) {
    this._resetErrors();
    var userGridID = this.getUserGridID(),
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
                            //todo: вернуть код

                            //_this.getSaveButton().removeClass('active');
                            if (refresh) {
                                //todo: вернуть код
                                //_this.refresh();
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
                        this.$form.find('a[data-pk=' + pk_key + '][rel=' + userGridID + '_' + errors[pk_key][column_key] + ']').closest('td').addClass('grid-error')
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
        var formID = this.getID(),
            fileModule = facade.getFilesModule();

        if (fileModule.isNotEmpty(formID)) {
            var isEmpty = $.isEmptyObject(deleted_obj);
            while (fileModule.isNotEmpty(formID)) {
                var defObj = this.getDefaultObj(),
                    ownerLock = defObj['ownerlock'],
                    file = fileModule.pop(formID);
                var rowID = file[0].rowID;
                if (isEmpty || !deleted_obj[rowID]) {
                    this.$form.fileupload({
                        formData: {FilesTypesID: 4, OwnerLock: ownerLock}
                    });
                    this.$form.fileupload('send', {files: file});
                }
            }
        }
        else {
            if (!$.isEmptyObject(deleted_obj)) {
                this.saveAttachment(this);
            } else {
                ch_messages_container.sendMessage('Данные не были изменены.', ChResponseStatus.WARNING);
            }
        }
        return [];
    }

    return false;
};
ChGridForm.prototype.saveAttachment = function (chForm) {
    var delData = chForm.getDeletedObj();
    if (!$.isEmptyObject(delData)) {
        for (var property in delData) {
            if (!$.isNumeric(property)) {
                delete delData[property];
            }
        }

        var chMsgContainer = chForm.getMessagesContainer(),
            data = {
                jsonChangedData: {},
                jsonDeletedData: JSON.stringify($.extend({}, delData))
            };
        $.ajax({
            type: 'POST',
            url: chForm.getSaveUrl(),
            data: data,
            async: false
        }).done(function (resp) {
            var chResp = new ChResponse(resp);
            if (chResp.isSuccess()) {
                //todo: вернуть код
                //chForm
                //    .clearChange()
                //    .refresh();
            }
            chResp.sendMessage(chMsgContainer);
        })
            .fail(function (resp) {
                chMsgContainer.sendMessage('Возникла непредвиденная ошибка при сохранении вложений.', ChResponseStatus.ERROR);
            });
    }
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
//ChGridForm.prototype.refresh = function (parentView) {
//    console.log("refresh")
//    var url = this.getRefreshUrl(),
//        parentView = parentView? parentView :this.getParentView(),
//        searchData = this.getSearchData(),
//        chMessagesContainer = this.getMessagesContainer(),
//        _this = this;
//    console.log(parentView, searchData)
//    $.ajax({
//        url: url + '&ParentView=' + parentView,
//        type: "POST",
//        data: searchData,
//        success: function (response, st, xhr) {
//            var chResponse = new ChSearchResponse(response);
//            var type = _this.getType();
//            if (chResponse.isSuccess()) {
//                if (type == 'map') {
//                    var $map = _this.$form.children('section').children('.map');
//                    var ch_map = facade.getFactoryModule().makeChMap($map);
//                    ch_map.refreshPoints(chResponse.getData(), chMessagesContainer);
//
//                } else if (type == 'canvas') {
//                    var $canvas = _this.$form.find('canvas');
//                    var ch_canvas = facade.getFactoryModule().makeChCanvas($canvas);
//                    var data = chResponse.getData();
//                    _this.updateStorage(data, {});
//                    var options = new ChCanvasOptions();
//                    ch_canvas.refreshData(data, options);
//                }
//                else {
//                    //_this.updateData(chResponse.getData(), chResponse.getOrder());
//                    _this._clearDeletedObj();
//                    _this._clearChangedObj();
//                    //todo: вернуть код
//                    //_this.clearSelectedArea();
//
//                }
//                var filterForm = _this.getFilterForm();
//                if (filterForm && typeof filterForm != 'undefined' && filterForm.$form.length) {
//
//                    var filters = filterForm.getAutoRefreshFiltersCol();
//                    if (filters.length) {
//                        //todo: сделать один общий ajax
//                        filters.forEach(
//                            /**
//                             * @param chFilter {ChFilter}
//                             */
//                                function (chFilter) {
//                                $.get('/majestic/filterLayout', {'name': chFilter.getKey(), view: _this.getView(), 'parentID': _this.getParentPK()}).done(function (response, st, xhr) {
//                                    var $filter = $('<li>' + response + '</li>');
//                                    var selValues = chFilter.getNamesSelectedValues();
//                                    chFilter.$elem.html($filter.html());
//                                    selValues.forEach(function (value) {
//                                        chFilter.$elem.find('[value="' + value + '"]').prop("checked", true);
//                                    })
//                                    delete xhr.responseText;
//                                    delete xhr;
//                                    delete response;
//
//                                }).fail(function () {
//                                    console.log('error')
//                                })
//                            })
//                    }
//
//                }
//            }
//            chResponse.destroy();
//            delete chResponse;
//            delete response;
//            delete xhr.responseText;
//            delete xhr;
//            facade.getFactoryModule().garbageCollection();
//
//        },
//        error: function (xhr, st, er) {
//            chMessagesContainer.sendMessage(er, ChResponseStatus.ERROR)
//        }
//    })
//};
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
    return this.$form.attr('id');
};
ChGridForm.prototype.getView = function () {
    return this.$form.attr("data-id");
};
ChGridForm.prototype.getTabCaption = function () {
    return this.$form.attr('data-tab-caption');
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
    if (this._ch_messages_container === null) {
        this._ch_messages_container = facade.getFactoryModule().makeChMessagesContainer(this.$form.find(".messages-container"));
    }
    return this._ch_messages_container;
};
ChGridForm.prototype._isAttachmentsModel = function () {
    return this.getView().indexOf(Chocolate.ATTACHMENTS_VIEW) != -1;
};

ChGridForm.prototype.toggleAllCols = function () {
    var
        //isHidden = this.chFormSettings.isShortVisibleMode(),
//        hiddenClass = ChOptions.classes.hiddenAllColsTable,
        $th = this.getFixedTable().find('[' + optionsModule.getClass('allowHideColumn') + ']');
    //todo: вернуть код
    //this.toggleColls(isHidden, $th);
    //this.chFormSettings.setShortVisibleMode(!isHidden);
    return this;
};
