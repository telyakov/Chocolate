var TreeFilterRO = (function (FilterRO) {
    'use strict';
    return FilterRO.extend({
        render: function (event, i) {
            var view = new TreeFilterView({
                    form: this.get('model'),
                    model: this,
                    id: this.getViewId(),
                    $el: $('body')
                });
            view.render(event, i);
        }
    });
})(FilterRO);