var TextFilterRO = (function (FilterRO, helpersModule) {
    'use strict';
    return FilterRO.extend({
        render: function(){
            var view = new TextFilterView({
                model: this,
                id: helpersModule.uniqueID()
            });
            return view.render();
        }
    });
})(FilterRO, helpersModule);