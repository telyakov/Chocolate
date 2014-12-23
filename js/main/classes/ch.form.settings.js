
/**
 * Обертка над локальным хранилищем данных
 * @param form {ChGridForm}
 * @constructor
 */
function ChFormSettings(form) {
    this.ch_grid_form = form;
    this._getStorage = function () {
        if (typeof(Chocolate.storage.local.grid_settings[form.getView()]) == 'undefined') {
            Chocolate.storage.local.grid_settings[form.getView()] = {}
        }
        return Chocolate.storage;
    };
}
ChFormSettings.prototype.setShortVisibleMode = function(value){
    var storage = this._getStorage();
    storage.local.grid_settings[this.ch_grid_form.getView()].shortVisibleMode = value
};

ChFormSettings.prototype.isShortVisibleMode = function(){
    var storage = this._getStorage();
    return storage.local.grid_settings[this.ch_grid_form.getView()].shortVisibleMode === true;
};
