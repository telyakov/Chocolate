var AgileFiltersCollections = (function (Backbone) {
    'use strict';
    return Backbone.Collection.extend({
        model: AgileFilter,
        $obj: null,
        initialize: function(models, opts) {
            this.$obj = opts.$obj;
        }
    });
})(Backbone);