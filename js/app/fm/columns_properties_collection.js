var ColumnsPropertiesCollection = (function (Backbone, $) {
    'use strict';
    return Backbone.Collection.extend({
        model: ColumnProperties,
        $obj: null,
        initialize: function(models, opts) {
            this.$obj = opts.$obj;
        },
        getRowColorColumnName: function () {
            this.$obj.children('rowColorColumnName').html();
        },
        getRowColorColumnNameAlternate: function () {
            this.$obj.children('rowColorColumnNameAlternate').html();
        }
    });
})(Backbone, jQuery);