var ActionProperties = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            $action: null
        },
        getCaption: function () {
            this.$action.children('caption').html();
        },
        getAction: function () {
            this.$action.children('action').html();
        },
        getRequiredRole: function () {
            this.$action.children('requiredRole').html();
        }
    });
})(Backbone);