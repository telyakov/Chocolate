var TextFilterRO = (function (FilterRO, helpersModule) {
    'use strict';
    return FilterRO.extend({
        render: function(event, i){
            var view = new TextFilterView({
                model: this,
                id: helpersModule.uniqueID()
            });
            return view.render(event, i);
        }
    });
})(FilterRO, helpersModule);