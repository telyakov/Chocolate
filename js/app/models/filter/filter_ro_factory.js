var FilterRoFactory = (function () {
    'use strict';
    var custom = 'customfilter',
        fast = 'fastfilter',
        checkBox = 'checkbox',
        tree = 'checkbox_tree',
        customFilterWithMultiselect = 'customfilter_with_multiselect',
        dateBetween = 'datebetween',
        _private = {
            isCustomFilter: function (type) {
                return type.indexOf(custom) !== -1;
            },
            isFastFilter: function (type) {
                return type.indexOf(fast) !== -1;
            },
            prepareType: function (filter) {
                var type = $.trim( filter.getFilterType().toLowerCase());
                if (_private.isCustomFilter(type)) {
                    var standartType = filter.getStandartType().toLowerCase();
                    if (standartType === '20') {
                        return checkBox;
                    } else {
                        return tree;
                    }
                } else if (_private.isFastFilter(type)) {
                    return fast;
                }
                return type;
            },
            make: function (filter) {
                var options = {filter: filter},
                    type = _private.prepareType(filter);
                switch(type){
                    case fast:
                        return new FastFilter(options);
                    case dateBetween:
                        return new DateRangeFilter(options);
                    case checkBox:
                        return new CheckBoxFilter(options);
                    case tree:
                        return new TreeFilter(options);
                    case custom:
                        return new SelectFilter(options);
                    case customFilterWithMultiselect:
                        return new TreeFilter(options);
                    default:
                        return new TextFilter(options);
                }
            }
        };
    return {
        make: function (filter) {
            return _private.make(filter);
        }
    };
})();