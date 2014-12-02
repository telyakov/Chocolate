var CheckBoxColumnRO = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return ColumnRO.extend({
        getHeaderOptions: function(){
            var options = CheckBoxColumnRO.__super__.getHeaderOptions.apply(this, arguments);
            options['class'] = 'sorter-checkbox';
            return options;
        }

    });
})(Backbone, helpersModule, FilterProperties, bindModule);