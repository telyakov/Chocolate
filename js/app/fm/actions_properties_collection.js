var ActionsPropertiesCollection = (function (Backbone) {
    'use strict';
    return Backbone.Collection.extend({
        model: ActionProperties
    });
})(Backbone);