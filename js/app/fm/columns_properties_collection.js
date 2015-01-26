var ColumnsPropertiesCollection = (function (Backbone, ColumnProperties) {
    'use strict';
    return Backbone.Collection.extend(
        /** @lends ColumnsPropertiesCollection */
        {
            model: ColumnProperties,
            $obj: null,
            /** @constructs */
            initialize: function (models, opts) {
                this.$obj = opts.$obj;
            },
            /**
             * @method destroy
             */
            destroy: function () {
                this.each(
                    /** @param property {ColumnProperties} */
                        function (property) {
                        property.destroy();
                    });
                this.set('$obj', null);

            },
            /**
             * @returns {String}
             */
            getRowColorColumnName: function () {
                return this.$obj.children('rowColorColumnName').text().toLowerCase();
            },
            /**
             * @returns {String}
             */
            getRowColorColumnNameAlternate: function () {
                return this.$obj.children('rowColorColumnNameAlternate').text().toLowerCase();
            }
        });
})(Backbone, ColumnProperties);