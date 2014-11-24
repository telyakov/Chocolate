var ActionProperties = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            $obj: null
        },
        getCaption: function () {
            this.$obj.children('caption').html();
        },
        getAction: function () {
            this.$obj.children('action').html();
        },
        getRequiredRole: function () {
            this.$obj.children('requiredRole').html();
        }
    });
})(Backbone);