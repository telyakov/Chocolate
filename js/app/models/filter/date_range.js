/**
 * Class DateRangeFilterRO
 * @class
 * @augments FilterRO
 */
var DateRangeFilterRO = (function (FilterRO) {
    'use strict';
    return FilterRO.extend(
        /** @lends DateRangeFilterRO */
        {
            /**
             * @param event {String}
             * @param i {int}
             * @param collection {FiltersROCollection}
             */
            render: function (event, i, collection) {
                var view = new DateRangeView({
                    form: this.get('model'),
                    model: this,
                    id: this.getViewId(),
                    $el: $('body')

                });
                this.persistLinkToView(view);
                view.render(event, i, collection);
            },
            /**
             * @returns {String}
             */
            getAttributeFrom: function () {
                return this.getAttribute();
            },
            /**
             * @returns {String}
             */
            getAttributeTo: function (attrFrom) {
                return attrFrom.replace('from', 'to');
            }
        });
})(FilterRO);