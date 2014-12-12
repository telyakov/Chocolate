var ColumnsPropertiesCollection = (function (Backbone, $) {
    'use strict';
    return Backbone.Collection.extend({
        model: ColumnProperties,
        $obj: null,
        initialize: function(models, opts) {
            this.$obj = opts.$obj;
        },
        getRowColorColumnName: function () {
            return this.$obj.children('rowColorColumnName').text().toLowerCase();
        },
        getRowColorColumnNameAlternate: function () {
            return this.$obj.children('rowColorColumnNameAlternate').text().toLowerCase();
        }
    });
})(Backbone, jQuery);