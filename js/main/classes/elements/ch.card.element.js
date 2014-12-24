function ChCardElement($elem) {
    this.$elem = $elem;
    this._ch_card = null;
    this._ch_grid_form = null;
}
ChCardElement.prototype._id = null;
ChCardElement.prototype.getID = function () {
    if (this._id === null) {
        this._id = this.getCard().getKey();
    }
    return this._id;
};
/**
 * @returns {ChCard}
 */
ChCardElement.prototype.getCard = function () {
    if (this._ch_card === null) {
        this._ch_card = facade.getFactoryModule().makeChCard(this.$elem.closest('div[data-id=grid-tabs]'));
    }
    return this._ch_card;
};
/**
 *
 * @returns {ChGridForm}
 */
ChCardElement.prototype.getGridForm = function () {
    if (this._ch_grid_form === null) {
        this._ch_grid_form = this.getCard().getGridForm();
    }
    return this._ch_grid_form;
};
ChCardElement.prototype.markAsNoChanged = function(){
    this.$elem.closest('.card-input').addClass('card-input-no-edit');
};

/**
 *
 * @param name
 * @param val2storage
 * @returns {ChCardElement}
 */
ChCardElement.prototype.setChangedValue = function (name, val2storage) {
    var changed_obj = this.getGridForm().getChangedObj();
    if (typeof changed_obj[this.getID()] === "undefined") {
        changed_obj[this.getID()] = {};
    }
    //TODO: добавить подсветку строк если надо
    changed_obj[this.getID()][name] = val2storage;
    return this;
};
/**
 *
 * @param name
 * @param value
 * @param visibleText
 * @returns {ChCardElement}
 */
ChCardElement.prototype.setChangedValueInGrid = function (name, value, visibleText) {
    var parentElem = this.getParentElement(name);
    parentElem.html(visibleText);
    parentElem.editable("setValue", value);
    return this;
};
ChCardElement.prototype.getParentElement =function(name){
    return this.getGridForm().$form.find("a[data-pk=" + this.getID() + "][rel$=" + name + "]");
};