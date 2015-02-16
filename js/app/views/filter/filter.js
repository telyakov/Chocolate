var FilterView = (function (Backbone, $) {
    'use strict';
    return Backbone.View.extend(
        /** @lends FilterView */
        {
            /**
             * @constructs
             * @extends Backbone.View
             */
            initialize: function (options) {
                _.bindAll(this);
                this.model = options.model;
                this.form = options.form;
                this.view = options.view;
                this.id = options.id;
                if (options.$el) {
                    this.$el = options.$el;
                }
            },
            /**
             * @returns {FilterRO}
             */
            getModel: function () {
                return this.model;
            },
            /**
             * @returns {string|undefined}
             */
            getValue: function () {
                return this.getModel().get('value');
            },
            /**
             * @desc destroy
             */
            destroy: function () {
                this.model = null;
                this.form = null;
                this.view = null;
                this.id = null;
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
            },
            /**
             * @description Send error event to mediator
             * @param {Object} opts custom object
             * @fires mediator#logError
             */
            publishError: function (opts) {
                mediator.publish(optionsModule.getChannel('logError'), opts);
            },
            /**
             * @abstract
             */
            runAsyncTaskGetCurrentValue: function () {
                this.publishError({
                    view: this,
                    error: 'not implemented runAsyncTaskGetCurrentValue method'
                })
            }
        });
})(Backbone, jQuery);