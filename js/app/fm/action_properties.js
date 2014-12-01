var ActionProperties = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            $obj: null
        },
        getCaption: function () {
            return this.get('$obj').children('caption').text();
        },
        getAction: function () {
            return this.get('$obj').children('action').text();
        },
        getRequiredRole: function () {
            return this.get('$obj').children('requiredRole').text();
        }
    });
})(Backbone);