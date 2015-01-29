/**
 * @class AppModel
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
