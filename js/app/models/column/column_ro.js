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
        getHeaderCLass: function(){
            if(this.isRequired()){
                return 'fa-asterisk';
            }
            return '';
        },
        isRequired: function(){
            return helpersModule.boolEval(this.get('columnProperties').getRequired(), false);
        },

        getCaption: function(){
            return this.get('columnProperties').getCaption();
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
            options['class'] = 'sorter-text';
            return options;
        }

});
})(Backbone, helpersModule, FilterProperties, bindModule);