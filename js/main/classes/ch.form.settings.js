
/**
 * Обертка над локальным хранилищем данных
 * @param ch_grid_form {ChGridForm}
 * @constructor
 */
function ChFormSettings(ch_grid_form) {
    this.ch_grid_form = ch_grid_form;
    this.auto_update_inerval_id = null;
    this.startAutoUpdate = function () {
        if (this.auto_update_inerval_id == null) {
            var _this = this;
            this.auto_update_inerval_id = setInterval(function () {
                if (!ch_grid_form.isHasChange()) {
                    console.log('allowupdate')
                    _this.ch_grid_form.refresh();
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
        if (typeof(Chocolate.storage.local.grid_settings[ch_grid_form.getView()]) == 'undefined') {
            Chocolate.storage.local.grid_settings[ch_grid_form.getView()] = {}
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

ChFormSettings.prototype.getGlobalStyle = function(){
    var storage = this._getStorage();
    var defaultValue;
    if(this.ch_grid_form.getView() !='tasks/tasksfortops.xml'){
        defaultValue =1;
    }else{
        defaultValue =2;
    }
    if(storage.local.grid_settings[this.ch_grid_form.getView()].globalStyle){
        return storage.local.grid_settings[this.ch_grid_form.getView()].globalStyle;
    }else{
        return defaultValue;
    }
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
