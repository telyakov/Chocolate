/**
 * Class FilterView
 * @class
 */
var FilterView = (function (Backbone, $) {
    'use strict';
    return Backbone.View.extend(
        /** @lends FilterView */
        {
            /**
             * @constructs
             */
            initialize: function (options) {
                _.bindAll(this, 'render');
                this.model = options.model;
                this.form = options.form;
                this.view = options.view;
                this.id = options.id;
                if (options.$el) {
                    this.$el = options.$el;
                }
            },
            /**
             * @method destroy
             */
            destroy: function(){
                this.model= null;
                this.form= null;
                this.view= null;
                this.id= null;
                this.$el = null;
                this.el = null;
                this.render = null;
            },
            /**
             * @param event {String}
             * @param i {int}
             * @param collection {FiltersROCollection}
             * @abstract
             */
            render: function (event, i, collection) {
            }
        });
})(Backbone, jQuery);