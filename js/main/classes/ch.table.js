function ChTable($table) {
    this.$table = $table;
    /**
     * @type {ChGridForm}
     */
    this.ch_form = facade.getFactoryModule().makeChGridForm($table.closest('form'));
}
//ChTable.prototype._initData = function () {
//
//    //this.ch_form.restoreData();
//};
