var CardRO = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            card: null,
            key: null
        },
        isVisible: function(){
            return helpersModule.boolEval(this.get('card').getVisible(), true);
        },
        getKey: function(){
            return this.get('card').getKey();
        },
        getCaption: function(){
            return this.get('card').getCaption();
        },
        getCaptionReadProc: function(){
            return this.get('card').getCaptionReadProc();
        },
        getCols: function(){
            return this.get('card').getCols();
        },
        getRows: function(){
            return this.get('card').getRows();
        }
    });
})(Backbone, helpersModule, FilterProperties, bindModule);