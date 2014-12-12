var TreeFilterRO = (function (FilterRO) {
    'use strict';
    return FilterRO.extend({
        render: function (event, i) {
            var id = helpersModule.uniqueID(),
                view = new TreeFilterView({
                    form: this.get('model'),
                    model: this,
                    id: id,
                    $el: $('body')
                });
            view.render(event, i);
        }
    });
})(FilterRO);