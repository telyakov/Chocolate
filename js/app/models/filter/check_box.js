var CheckBoxFilterRO = (function (FilterRO) {
    'use strict';
    return FilterRO.extend({
        render: function(event, i, collection){
            var view = new CheckBoxView({
                form: this.get('model'),
                model: this,
                id: this.getViewId(),
                $el: $('body')

            });
            view.render(event, i, collection);
        }
    });
})(FilterRO);