/**
 * @module ColumnsRoFactory
 * @static
 */
var ColumnsRoFactory = (function () {
    'use strict';
    var _private = {
        make: function (column) {
            var type = column.getEditType(),
                options = {columnProperties: column};

            switch(type){
                case 'texdialog':
                    return new TextColumnRO(options);
                case 'text':
                    return new TextColumnRO(options);
                case 'date':
                    return new DateColumnRO(options);
                case 'valuelistwithoutblank':
                    return new SelectColumnRO(options);
                case 'valuelist':
                    return new SelectColumnRO(options);
                case 'valuelistallownew':
                    return new SelectColumnRO(options);
                case 'selectitems':
                    return new TreeColumnRO(options);
                case 'datetime':
                    return new DateColumnRO(options);
                case 'checkbox':
                    return new CheckBoxColumnRO(options);
                case 'button':
                    return new FormColumnRO(options);
                case 'onoff':
                    return new CheckBoxColumnRO(options);
                case 'treedialog':
                    return new TreeColumnRO(options);
                default :
                    return new TextColumnRO(options);
            }
        }
    };
    return {
        /**
         * @param column {ColumnProperties}
         * @returns {ColumnRO}
         */
        make: function (column) {
            return _private.make(column);
        }
    };
})();