var CheckBoxFilterRO = (function (FilterRO) {
    'use strict';
    return FilterRO.extend({
        render: function(event, i, collection){
            var view = new CheckBoxView({
                model: this,
                id: helpersModule.uniqueID(),
                $el: $('body')

            });
            view.render(event, i, collection);
        }
    });
})(FilterRO);