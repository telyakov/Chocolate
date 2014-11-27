var FilterRO = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            filter: null,
            id: null
        },
        getAttribute: function(){
            return this.get('filter').getName();
        },
        getCaption: function(){
            return this.get('filter').getCaption();
        },
        getTooltip: function(){
            return this.get('filter').getTooltipText();
        },
        isEnabledEval: function(deferID){
            return helpersModule.boolExpressionEval(this.get('filter').getEnabled(), deferID,  true);
        },
        getDefaultValue: function(){
            return this.get('filter').getDefaultValue();
        },
        getValueFormat: function(){
            return this.get('filter').getValueFormat();
        },
        isMultiSelectEval: function(deferID){
            return  helpersModule.boolExpressionEval(this.get('filter').getMultiSelect(), deferID, false);
        },
        getReadProc: function(){
            return bindModule.bindSql(this.get('filter').getReadProc());
        },
        isVisibleEval: function(deferID){
            return helpersModule.boolExpressionEval(this.get('filter').getVisible(), deferID, true);
        },
        isNextRowEval: function(deferID){
            return helpersModule.boolExpressionEval( this.get('filter').getToNextRow(), deferID, false);
        },
        getProperties: function(){
            return new FilterProperties({
                expression: this.get('filter').getProperties()
            });
        }
    });
})(Backbone, helpersModule, FilterProperties, bindModule);