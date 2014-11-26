var TreeFilterRO = (function (FilterRO) {
    'use strict';
    return FilterRO.extend({
        render: function(event, i){
            var view = new TreeFilterView({
                model: this,
                id: helpersModule.uniqueID()
            });
            return view.render(event, i);
        }
    });
})(FilterRO);