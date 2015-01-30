/**
 * Class TextFilterRO
 * @class
 * @augments FilterRO
 */
var TextFilterRO = (function (FilterRO) {
    'use strict';
    return FilterRO.extend(
        /** @lends TextFilterRO */

        {
            /**
             * @param event {String}
             * @param i {int}
             */
            render: function (event, i) {
                var view = new TextFilterView({
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