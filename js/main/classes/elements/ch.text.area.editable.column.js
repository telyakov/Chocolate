/**
 * @param $elem {jQuery}
 * @constructor
 */
function ChTextColumn($elem) {
    ChEditable.apply(this, arguments);
}
/**
 * @param e {Event}
 * @param params
 * @returns {boolean}
 */
ChTextColumn.SaveHandler = function (e, params) {
    var data = e.data;
    if (data && data.isEdit && data.$popup && data.$elem && data.column && data.name) {
        if (typeof params.newValue !== 'undefined') {
            data.column.setChangedValue(data.name, params.newValue);
            data.$elem.editable('setValue', params.newValue);
            data.$popup.empty();
        }
        return true;
    }
    return false;
};
ChTextColumn.prototype = Object.create(ChEditable.prototype);
ChTextColumn.prototype.create = function (context, e, allowEdit, name, caption, isMarkupSupport) {
    var column = new ChGridColumnBody(this.$elem),
        isEdit = chCardFunction._isAllowEdit(column.getDataObj(), allowEdit);
    if (!isEdit) {
        $(context).unbind('click');
        column.markAsNoChanged();
    }
    var $modalBtn = $("<div class='grid-modal-open form-modal-button'></div>")
        .attr('data-edit', +isEdit)
        .attr('data-name', name)
        .attr('data-caption', caption)
        .attr('data-markup', isMarkupSupport);
    this.$elem.parent().append($modalBtn);

};
