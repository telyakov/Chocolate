/**
 * Класс отвечающий за закладки в шоколаде(как в карточке так и глобальные)
 * @param $a {jQuery}
 * @constructor
 */
function ChTab($a) {
    this.$a = $a;
}
ChTab.prototype._id = null;
ChTab.prototype._panel_id = null;
ChTab.prototype._$li = null;
ChTab.prototype._$panel = null;
ChTab.prototype._is_card_type_panel = null;
ChTab.prototype._$card_content = null;
ChTab.prototype._$ul = null;
ChTab.prototype.getID = function () {
    if (this._id == null) {
        this._id = this.$a.attr('id');
    }
    return this._id;

};
/**
 * @returns {jQuery}
 */
ChTab.prototype.getCardContent = function () {
    this._$card_content = this.getPanel().find('div.card-content');
    return this._$card_content;
};
/**
 * @returns {boolean}
 */
ChTab.prototype.isCardTypePanel = function () {
    if (this._is_card_type_panel == null) {
        this._is_card_type_panel = this.getPanel().hasClass(optionsModule.getClass('card'));
    }
    return this._is_card_type_panel;
};
/**
 * @returns {jQuery}
 */
ChTab.prototype.getLi = function () {
    if (this._$li == null) {
        this._$li = this.$a.parent();
    }
    return this._$li;
};
/**
 * @returns {string}
 */
ChTab.prototype.getPanelID = function () {
    if (this._panel_id == null) {
        this._panel_id = this.getLi().attr('aria-controls');
    }
    return  this._panel_id;
};
/**
 * @returns {jQuery}
 */
ChTab.prototype.getPanel = function () {
    if (this._$panel == null) {
        this._$panel = $('#' + this.getPanelID());
    }
    return this._$panel;
};
/**
 * @returns {jQuery}
 */
ChTab.prototype.getListContainer = function () {
    if (this._$ul == null) {
        this._$ul = this.$a.closest('ul');
    }
    return this._$ul;
}
/**
 * @returns {integer|string}
 */
ChTab.prototype.getIndex = function () {
    return this.$a.closest('ul').find('li').index(this.$a.parent());
};