/**
 * @function
 * @name Deferred.done
 * @param {function(element:jQuery)} callback
 */
var AppModel = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            userName: null,
            userId: null,
            employeeId: null
        }
    });
})(Backbone);
