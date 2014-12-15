var CardElement = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            columns: null,
            key: null
        }
    });
})(Backbone, helpersModule, FilterProperties, bindModule);