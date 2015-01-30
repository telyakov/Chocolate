/**
 * Class CheckBoxFilterRO
 * @class
 * @augments FilterRO
 */
var CheckBoxFilterRO = (function (FilterRO) {
    'use strict';
    return FilterRO.extend(
        /** @lends CheckBoxFilterRO */

        {
            /**
             * @param event {String}
             * @param i {int}
             * @param collection {FiltersROCollection}
             */
            render: function (event, i, collection) {
                var view = new CheckBoxView({
                    form: this.get('model'),
                    model: this,
                    id: this.getViewId(),
                    $el: this.get('$el')
                });
                this.persistLinkToView(view);
                view.render(event, i, collection);
            }
        });
})(FilterRO);