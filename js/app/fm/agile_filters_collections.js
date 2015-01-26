var AgileFiltersCollections = (function (Backbone, AgileFilter) {
    'use strict';
    return Backbone.Collection.extend(
        /** @lends AgileFiltersCollections */
        {
            model: AgileFilter,
            $obj: null,
            /** @constructs */
            initialize: function (models, opts) {
                this.$obj = opts.$obj;
            },
            /**
             * @method destroy
             */
            destroy: function () {
                this.each(
                    /** @param filter {AgileFilter} */
                        function (filter) {
                        filter.destroy();
                    });
                this.set('$obj', null);

            }
        });
})(Backbone, AgileFilter);