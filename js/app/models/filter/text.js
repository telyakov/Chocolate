var TextFilterRO = (function (FilterRO, helpersModule) {
    'use strict';
    return FilterRO.extend({
        render: function(event, i){
            var view = new TextFilterView({
                form: this.get('model'),
                model: this,
                id: this.getViewId()
            });
            view.render(event, i);
        }
    });
})(FilterRO, helpersModule);