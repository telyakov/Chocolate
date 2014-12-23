
function ChGridColumnBody($cell) {
    this.$cell = $cell;
    this._$row = null;
    this._id = null;
    this._ch_form = null;
    this.destroy = function(){
        delete this._$row;
        delete this.$cell;
    }
}
ChGridColumnBody.prototype = {
    getID: function () {
        if (this._id === null) {
            this._id = this.getRow().attr("data-id");
        }
        return  this._id;
    },
    getRow: function () {
        if (this._$row === null) {
            this._$row = this.$cell.closest('tr');
        }
        return this._$row;
    },
    /**
     * @returns {ChGridForm}
     */
    getChForm: function () {
        if (this._ch_form === null) {
            this._ch_form = facade.getFactoryModule().makeChGridForm(this.$cell.closest('form'));
        }
        return this._ch_form;
    },
    setChangedValue: function (name, val2storage) {
        var changed_obj = this.getChForm().getChangedObj();
        if (typeof(changed_obj[this.getID()]) === "undefined") {
            changed_obj[this.getID()] = {};
        }
        var row_obj = changed_obj[this.getID()];
        row_obj[name] = val2storage;
        this.getRow().addClass('grid-row-changed');
        //todo: вернуть код
        //this.getChForm().getSaveButton().addClass('active');
    }
};
ChGridColumnBody.prototype.getDataObj = function(){
    return this.getChForm().getDataObj()[this.getID()];
};
ChGridColumnBody.prototype.markAsNoChanged = function(){
    var classes = chApp.namespace('options.classes');
    this.$cell.closest('td').addClass(classes.notChanged);
};