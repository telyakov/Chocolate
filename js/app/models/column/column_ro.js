var ColumnRO = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            columnProperties: null,
            id: null,
            key: null
        },
        initialize: function() {
            this.set('key', this.get('columnProperties').getVisibleKey());
        },
        isVisibleInAllField: function(){
          return helpersModule.boolEval(this.get('columnProperties').getAllFields(), false);
        },
        getHeaderOptions: function(){
            var options = {};
            options['data-id'] = this.get('key');
            var isEdit = helpersModule.boolEval(this.get('columnProperties').getAllowEdit(), true);
            if(!isEdit){
                options['data-changed'] = 0;
            }
            if(this.isVisibleInAllField()){
                options['data-col-hide'] = 1;
            }
            return options;
            //$editType = $this->columnProperties->getGridEditType();
            //if ($editType == GridColumnType::Attachments || $editType == GridColumnType::Button) {
            //    $options['data-grid-button'] = 1;
            //}
            //if ($editType == GridColumnType::DateTime || $editType == GridColumnType::Date) {
            //
            //    $options['class'] = 'sorter-shortDate ';
            //} elseif ($editType == GridColumnType::CheckBox) {
            //    $options['class'] = 'sorter-checkbox';
            //} else {
            //    $options['class'] = 'sorter-text';
            //}
        },
        getHeader: function(){

        }


});
})(Backbone, helpersModule, FilterProperties, bindModule);