var ColumnsRoFactory = (function () {
    'use strict';
    var _private = {
        make: function (column) {
            var options = {columnProperties: column};
            return new ColumnRO(options);
        }
    };
    return {
        make: function (column) {
            return _private.make(column);
        }
    };
})();