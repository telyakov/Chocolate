
/**
 * Обертка над локальным хранилищем данных
 * @param form {ChGridForm}
 * @constructor
 */
function ChFormSettings(form) {
    this.ch_grid_form = form;
    this.auto_update_inerval_id = null;
    this.startAutoUpdate = function () {
        if (this.auto_update_inerval_id == null) {
            var _this = this;
            this.auto_update_inerval_id = setInterval(function () {
                if (form.$form.is(':visible') && !form.isHasChange()) {
                    //todo: вернуть код
                    //_this.ch_grid_form.refresh();
                }
            }, ChOptions.settings.defaultAutoUpdateMS)
        }
    };
    this._stopAutoUpdate = function () {
        if (this.auto_update_inerval_id != null) {
            clearInterval(this.auto_update_inerval_id);
        }
    };
    this._getStorage = function () {
        if (typeof(Chocolate.storage.local.grid_settings[form.getView()]) == 'undefined') {
            Chocolate.storage.local.grid_settings[form.getView()] = {}
        }
        return Chocolate.storage;
    };
}
ChFormSettings.prototype.isAutoUpdate = function () {
    var auto_update = this._getStorage().local.grid_settings[this.ch_grid_form.getView()].auto_update;
    if (typeof(auto_update) != 'undefined' && auto_update) {
        return true;
    }
    return false
};
ChFormSettings.prototype.setGlobalStyle = function(value){
    var storage = this._getStorage();
    storage.local.grid_settings[this.ch_grid_form.getView()].globalStyle = value;
};
/**
 * @param value {boolean}
 */
ChFormSettings.prototype.setSystemVisibleMode = function(value){
    var storage = this._getStorage();
    storage.local.grid_settings[this.ch_grid_form.getView()].systemtVisibleMode = value
};

ChFormSettings.prototype.isSystemVisibleMode = function(){
    var storage = this._getStorage();
    return storage.local.grid_settings[this.ch_grid_form.getView()].systemtVisibleMode === true;
};


/**
 * @param value {boolean}
 */
ChFormSettings.prototype.setShortVisibleMode = function(value){
    var storage = this._getStorage();
    storage.local.grid_settings[this.ch_grid_form.getView()].shortVisibleMode = value
};

ChFormSettings.prototype.isShortVisibleMode = function(){
    var storage = this._getStorage();
    return storage.local.grid_settings[this.ch_grid_form.getView()].shortVisibleMode === true;
};
/**
 *
 * @param value {boolean}
 */
ChFormSettings.prototype.setAutoUpdate = function (value) {
    var storage = this._getStorage();
    storage.local.grid_settings[this.ch_grid_form.getView()].auto_update = value
    if (value) {
        this.startAutoUpdate();
    } else {
        this._stopAutoUpdate();
    }
}
