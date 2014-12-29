var ActionProperties = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            $obj: null
        },
        /**
         * @returns {jQuery}
         */
        getJqueryObj: function(){
          return this.get('$obj');
        },
        getCaption: function () {
            return this.getJqueryObj().children('caption').text();
        },
        getAction: function () {
            return this.getJqueryObj().children('action').text();
        },
        getRequiredRole: function () {
            return this.getJqueryObj().children('requiredRole').text();
        }
    });
})(Backbone);