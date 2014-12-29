function ChTab($a) {
    this.$a = $a;
}
ChTab.prototype.getID = function () {
    return this.$a.attr('id');
};
/**
 * @returns {jQuery}
 */
ChTab.prototype.getCardContent = function () {
    return this.getPanel().find('.card-content');
};
/**
 * @returns {boolean}
 */
ChTab.prototype.isCardTypePanel = function () {
    return this.getPanel().hasClass(optionsModule.getClass('card'));
};
/**
 * @returns {jQuery}
 */
ChTab.prototype.getLi = function () {
    return this.$a.parent();
};
/**
 * @returns {string}
 */
ChTab.prototype.getPanelID = function () {
    return this.getLi().attr('aria-controls');
};
/**
 * @returns {jQuery}
 */
ChTab.prototype.getPanel = function () {
    return $('#' + this.getPanelID());
};
/**
 * @returns {int|string}
 */
ChTab.prototype.getIndex = function () {
    return this.$a.closest('ul').find('li').index(this.$a.parent());
};