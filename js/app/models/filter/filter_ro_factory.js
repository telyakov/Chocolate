var FilterRoFactory = (function () {
    'use strict';
    var custom = 'customfilter',
        fast = 'fastfilter',
        checkBox = 'checkbox',
        tree = 'checkbox_tree',
        dateBetween = 'datebetween',
        _private = {
            isCustomFilter: function (type) {
                return type.indexOf(custom) !== -1;
            },
            isFastFilter: function (type) {
                return type.indexOf(fast) !== -1;
            },
            prepareType: function (filter) {
                var type = $.trim(filter.getFilterType().toLowerCase());
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
            make: function (filter, view, $el) {
                var options = {filter: filter, model: view.model, view: view, $el: $el},
                    type = _private.prepareType(filter);
                switch (type) {
                    case fast:
                        return new FastFilterRO(options);
                    case dateBetween:
                        return new DateRangeFilterRO(options);
                    case checkBox:
                        return new CheckBoxFilterRO(options);
                    case tree:
                        return new TreeFilterRO(options);
                    default:
                        return new TextFilterRO(options);
                }
            }
        };
    return {
        make: function (filter, view, $el) {
            return _private.make(filter, view, $el);
        }
    };
})();