var CardRO = (function (Backbone, helpersModule) {
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
        hasSaveButtons: function(){
          return this.getKey().toLowerCase() !== 'обсуждения';
        },
        getCaption: function(){
            return this.get('card').getCaption();
        },
        getCaptionReadProc: function(){
            return this.get('card').getCaptionReadProc();
        },
        getCols: function(){
            return parseInt(this.get('card').getCols(), 10);
        },
        getRows: function(){
            return parseInt(this.get('card').getRows(), 10);
        }
    });
})(Backbone, helpersModule);