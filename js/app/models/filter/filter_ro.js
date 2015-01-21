var FilterRO = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            model: null,
            filter: null,
            view: null,
            id: null,
            key: null,
            value: null
        },
        initialize: function () {
            this.set('key', this.get('filter').getName());
        },
        getAttribute: function () {
            return this.get('filter').getName();
        },
        getCaption: function () {
            return this.get('filter').getCaption();
        },
        getTooltip: function () {
            return this.get('filter').getTooltipText();
        },
        isEnabledEval: function (deferID) {
            var evaluatedValue = this.get('filter').getEnabled();
            if(this.get('value')){
                evaluatedValue = 'true';
            }
            return helpersModule.boolExpressionEval(evaluatedValue, deferID, true);
        },
        getValue: function () {
            if (this.get('value')) {
                return this.get('value');
            }
            return this.getDefaultValue();
        },
        getDefaultValue: function () {
            return this.get('filter').getDefaultValue();
        },
        getValueFormat: function () {
            return this.get('filter').getValueFormat();
        },
        isMultiSelectEval: function (deferID) {
            return helpersModule.boolExpressionEval(this.get('filter').getMultiSelect(), deferID, false);
        },
        readProcEval: function (data) {
            return bindModule.deferredBindSql(this.get('filter').getReadProc(), data);
        },
        isVisibleEval: function (deferID) {
            return helpersModule.boolExpressionEval(this.get('filter').getVisible(), deferID, true);
        },
        isNextRowEval: function (deferID) {
            return helpersModule.boolExpressionEval(this.get('filter').getToNextRow(), deferID, false);
        },
        getProperties: function () {
            return new FilterProperties({
                expression: this.get('filter').getProperties()
            });
        },
        getEventChange: function () {
            return this.get('filter').getEvent_change();
        }
    });
})(Backbone, helpersModule, FilterProperties, bindModule);