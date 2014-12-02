var DateColumnRO = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return ColumnRO.extend({
        getHeaderOptions: function(){
            var options = DateColumnRO.__super__.getHeaderOptions.apply(this, arguments);
            options['class'] = 'sorter-shortDate';
            console.log(options)
            return options;
        }

    });
})(Backbone, helpersModule, FilterProperties, bindModule);