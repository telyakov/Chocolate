function ChCard($grid_tabs) {
    this.$grid_tabs = $grid_tabs;
    this._save_url = null;
    this._$container = null;
    this._key = null;
    this._view = null;
    this._form_id = null;
    this._$grid_form = null;
    this._container_id = null;
    this._$header = null;
    this._$error_container = null;
    this._parentItem = null;
}

ChCard.prototype.getTabDataUrl = function (tabID) {
    return [
        ChOptions.urls.cardGet,
        '?view=',
        this.getView(),
        "&tabID=",
        encodeURIComponent(tabID),
        "&viewID=",
        this.getFormID(),
        "&pk=",
        this.getKey()
    ].join('');
};
ChCard.prototype.getHeaderContainer = function () {
    if (this._$header === null) {
        this._$header = this.getContainer().children('header');
    }
    return this._$header;
};
ChCard.prototype.getErrorContainer = function () {
    if (this._$error_container === null) {
        this._$error_container = this.getHeaderContainer().children('.card-error');
    }
    return this._$error_container;

};
ChCard.prototype.getSaveUrl = function () {
    if (this._save_url === null) {
        this._save_url = this.$grid_tabs.attr('data-save-url');
    }
    return this._save_url;
};
ChCard.prototype.getContainer = function () {
    if (this._$container === null) {
        this._$container = this.$grid_tabs.parent('div');
    }
    return this._$container;

};
ChCard.prototype.getKey = function () {
    if (this._key === null) {
        //TODO: сменить на дата-кей;
        this._key = this.$grid_tabs.attr('data-pk');
    }
    return this._key;
};
ChCard.prototype.getView = function () {
    if (this._view === null) {
        this._view = this.$grid_tabs.attr("data-view");
    }
    return this._view;
};
ChCard.prototype.getFormID = function () {
    if (this._form_id === null) {
        this._form_id = this.$grid_tabs.attr('data-form-id');
    }
    return this._form_id;
};
ChCard.prototype.getFmCardCollection = function () {
    return this.getGridForm().getFmCardsCollection();
};
/**
 *
 * @returns {ChGridForm}
 */
ChCard.prototype.getGridForm = function () {
    if (this._$grid_form === null) {
        this._$grid_form = facade.getFactoryModule().makeChGridForm($('#' + this.getFormID()));
    }
    return this._$grid_form;
};
ChCard.prototype.getContainerID = function () {
    if (this._container_id === null) {
        this._container_id = this.getContainer().attr('id');
    }
    return this._container_id;
};
ChCard.prototype._closeCard = function () {
    var id = this.getContainerID(),
        $li = Chocolate.$content.find('li[aria-controls=' + id + ']');
    Chocolate.tab.close($li.children('a'));
};
ChCard.prototype.getChangedObj = function () {
    var form = this.getGridForm(),
        pk = this.getKey();
    if (typeof form.getChangedObj() === 'undefined') {
        return {};
    }
    return form.getChangedObj()[pk];
};
ChCard.prototype.getDataObj = function () {
    var form = this.getGridForm(),
        pk = this.getKey();
    return form.getDataObj()[pk];
};
ChCard.prototype._isChanged = function () {
    var changeObj = this.getChangedObj();
    return !$.isEmptyObject(changeObj);
};
ChCard.prototype.getActualDataObj = function () {
    return Chocolate.mergeObj(this.getDataObj(), this.getChangedObj());
};
ChCard.prototype.validate = function (data_obj) {
    var form = this.getGridForm(),
        errors = form.validate(data_obj);
    if ($.isEmptyObject(errors)) {
        return true;
    } else {
        this._showErrors(errors);
        return false;
    }
};
ChCard.prototype._showErrors = function (errors) {
    var pk = this.getKey();
    for (var key in  errors) {
        this.$grid_tabs.find('a[rel=' + errors[key] + '_' + pk + ']')
            .closest('div.card-col')
            .children('label').addClass('card-error');
    }
};
ChCard.prototype._resetErrors = function () {

};
ChCard.prototype._clearChangeObj = function () {
    var changed_obj = this.getGridForm().getChangedObj();
    delete changed_obj[this.getKey()];
};
ChCard.prototype.getGridCollection = function () {
    var collection = [];
    this.$grid_tabs.find('.grid-form').each(function () {
        var form = facade.getFactoryModule().makeChGridForm($(this));
        collection.push(form);
    });
    return collection;
};
ChCard.prototype.save = function () {
    this._resetErrors();
    var success = true,
        gridErrors = [],
        childGrids = this.getGridCollection();
    childGrids.forEach(function (chForm) {
        /**
         * @type {ChGridForm}
         */
        gridErrors = chForm.save(false);
        if (!$.isEmptyObject(gridErrors)) {
            success = false;
        }
    });
    if (success) {
        if (this._isChanged() || !$.isNumeric(this.getKey())) {
            var actualDataObj = this.getActualDataObj();
            if (this.validate(actualDataObj)) {
                var gridForm = this.getGridForm(),
                    url = this.getSaveUrl(),
                    changedData = {},
                    _this = this;

                changedData[this.getKey()] = actualDataObj;
                var data = {
                    jsonChangedData: JSON.stringify(changedData),
                    jsonDeletedData: {}
                };
                $.post(url, data)
                    .done(function (response) {
                        var chResponse = new ChResponse(response);
                        if (chResponse.isSuccess()) {
                            _this._closeCard();
                            chResponse.sendMessage(gridForm.getMessagesContainer());
                            gridForm.refresh();
                        } else {
                            var msgContainer = facade.getFactoryModule().makeChMessagesContainer(_this.getErrorContainer());
                            chResponse.sendMessage(msgContainer);
                        }
                    })
                    .fail(function (res) {
                        var msgContainer = facade.getFactoryModule().makeChMessagesContainer(_this.getErrorContainer());
                        msgContainer._sendErrorMessage('Возникла непредвиденная ошибка при сохранении');
                    });
            }
        } else {
            this._closeCard();
        }
    } else {
        var moduleMessages= chApp.getMessages(),
            errorMessage = moduleMessages.NotFilledRequiredFields;
        facade.getFactoryModule()
            .makeChMessagesContainer(this.getErrorContainer())
            .sendMessage(errorMessage, chApp.getResponseStatuses().ERROR);
    }

};
ChCard.prototype.setElementValue = function ($card_element, value, isEdit, text) {
    $card_element.editable('setValue', value);
    if (!isEdit) {
        $card_element.editable('disable');
    }
    //затык для селект 2
    if (typeof(text) !== 'undefined' && text !== null && text.length > 0) {
        $card_element.text(text);
    }
};

ChCard.prototype._undoChange = function () {
    var pk = this.getKey(), _this = this;
    if (this._isChanged()) {
        var changed_obj = this.getChangedObj(),
            dataObj = this.getDataObj(),
            $tr = this.getParentItem();
        jQuery.each(changed_obj, function (i, val) {
            var $gridCell = $tr.find(" a[data-pk=" + pk + "][rel$=" + i + "]"),
                oldValue = $gridCell.attr("data-value");
            if ($gridCell.length) {
                if(oldValue === 'null'){
                    oldValue = '';
                }
                $gridCell.editable("setValue", oldValue, true);

                var fromID = $gridCell.data().editable.options['data-from-id'];
                if (fromID) {
                    $gridCell.html(dataObj[fromID]);

                }
            }
        });
    }
};
/**
 * @returns {jQuery}
 */
ChCard.prototype.getParentItem = function(){
  if(this._parentItem === null){
      this._parentItem = this.getGridForm().getTable().find('tr[data-id="'+ this.getKey()+'"]');
  }
    return this._parentItem;
};
ChCard.prototype._removeParentItem = function(){
    if(!$.isNumeric(this.getKey())){
        this.getParentItem().remove();
    }
};
ChCard.prototype.undoChange = function () {
    this._undoChange();
    this._closeCard();
    this._clearChangeObj();
    this._removeParentItem();
};