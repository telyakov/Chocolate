/**
 * Class TreeFilterRO
 * @class
 * @augments FilterRO
 */
var TreeFilterRO = (function (FilterRO) {
    'use strict';
    return FilterRO.extend(
        /** @lends TreeFilterRO */
        {
            /**
             * @param event {String}
             * @param i {int}
             */
            render: function (event, i) {
                var view = new TreeFilterView({
                    form: this.get('model'),
                    model: this,
                    id: this.getViewId(),
                    $el: this.get('$el')
                });
                this.persistLinkToView(view);
                view.render(event, i);
            }
        });
})(FilterRO);