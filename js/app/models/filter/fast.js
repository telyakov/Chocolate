var FastFilter = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            filter: null
        }
    });
})(Backbone);