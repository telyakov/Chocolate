var DateRangeFilterRO = (function (FilterRO) {
    'use strict';
    return FilterRO.extend({
        render: function(event, i, collection){
            var view = new DateRangeView({
                form: this.get('model'),
                model: this,
                id: this.getViewId(),
                $el: $('body')

            });
            view.render(event, i, collection);
        },
        getAttributeFrom: function(){
            return this.getAttribute();
        },
        getAttributeTo: function(attrFrom){
            return attrFrom.replace('from', 'to');
        }
    });
})(FilterRO);