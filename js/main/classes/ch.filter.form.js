function ChFilterForm($filter_form) {
    this.$form = $filter_form;
}
ChFilterForm.prototype.getValueByKey = function (filterKey) {
    var key = this.prepareKey(filterKey);
    var value = this.getData()[key];
    if (typeof value !== 'undefined') {
        return value;
    }
    return '';
};
ChFilterForm.prototype.prepareKey = function (key) {
    if (key.slice(-2) == '[]') {
        key = key.slice(0, key.length - 2);
    }
    return key;
};
ChFilterForm.prototype.getCaptionByKey = function (filterKey) {
    var caption = '';
    this.$form.find('[name="' + filterKey + '"]').eq(0).closest('li').find('input[type="checkbox"]:checked + label,  input[type="radio"]:checked + label')
        .each(function (i, item) {
            if (i > 0) {
                caption += '/';
            }
            caption += $(item).text();
        });
    return caption;
};
ChFilterForm.prototype.getData = function () {
    var data = this.$form.serializeArray(),
        result = {},
        _this = this;
    $.each(data, function (i, element) {
        var value = element.value,
            name = element.name;
        if (name.slice(-2) == '[]') {
            name = name.slice(0, name.length - 2);
            if (typeof result[name] === 'undefined') {
                result[name] = '';
            }
            result[name] += value + '|';
        } else {
            if (value != '') {
                if (_this.$form.find('[name="' + name + '"]').closest('li').attr('data-format') == 'idlist') {
                    // Convert "18 19     22" to "18|20|"
                    var numericArray = value.split(' ');
                    numericArray = numericArray.filter(function (val) {
                        return val !== '';
                    });
                    result[name] = numericArray.join('|') + '|';
                } else {
                    result[name] = value;
                }
            }
        }
    });
    return result;
};
ChFilterForm.prototype.getFiltersObj = function () {
    return this.$form.find('.' + ChOptions.classes.filterClass);
};
ChFilterForm.prototype.getAutoRefreshFiltersCol = function () {
    var collection = [];
    this.getFiltersObj().each(function () {
        var chFilter = facade.getFactoryModule().makeChFilter($(this));
        if (chFilter.isAutoRefresh()) {
            collection.push(chFilter);
        }
    });
    return collection;
};