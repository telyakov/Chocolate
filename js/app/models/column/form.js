var FormColumnRO = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return ColumnRO.extend({
        getHeaderOptions: function(){
            var options = CheckBoxColumnRO.__super__.getHeaderOptions.apply(this, arguments);
            options['data-grid-button'] = 1;

            return options;
        },
        getClass: function () {
            var class_name = '';
            if (!this.isEdit()) {
                class_name += 'not-changed';
            }
            class_name += ' grid-button';
            return class_name;
        }

    });
})(Backbone, helpersModule, FilterProperties, bindModule);