var FormColumnRO = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return ColumnRO.extend({
        getHeaderOptions: function(){
            var options = CheckBoxColumnRO.__super__.getHeaderOptions.apply(this, arguments);
            options['data-grid-button'] = 1;

            return options;
        }

    });
})(Backbone, helpersModule, FilterProperties, bindModule);