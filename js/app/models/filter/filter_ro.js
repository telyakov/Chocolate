var FilterRO = (function (Backbone) {
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
        isDisabled: function(){
            return !this.get('filter').getEnabled();
        },
        getDefaultValue: function(){
            return this.get('filter').getDefaultValue();
        },
        getValueFormat: function(){
            return this.get('filter').getValueFormat();
        }
    });
})(Backbone);