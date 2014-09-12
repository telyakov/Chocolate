/**
 * @param $elem {jQuery}
 * @constructor
 */
function ChEditable($elem) {
    this.$elem = $elem;
}
ChEditable.prototype.getTitle = function (pk, caption) {
    if ($.isNumeric(pk)) {
        return caption + ' [' + pk + ']'
    } else {
        return caption;
    }
};
ChEditable.getTitle = function (pk, caption) {
    if ($.isNumeric(pk)) {
        return caption + ' [' + pk + ']'
    } else {
        return caption;
    }
};