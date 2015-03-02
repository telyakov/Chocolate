var FilterRO = (function (Backbone, helpersModule, FilterProperties, bindModule, deferredModule) {
    'use strict';
    return Backbone.Model.extend(
        /** @lends FilterRO */
        {
            defaults: {
                model: null,
                filter: null,
                view: null,
                id: null,
                key: null,
                value: null,
                $el: null
            },
            _view: null,
            _properties: null,
            _id: null,
            getViewId: function () {
                if (this._id === null) {
                    this._id = helpersModule.uniqueID();
                }
                return this._id;
            },
            /**
             * @param {FiltersROCollection} collection
             */
            refresh: function (collection) {
                var _this = this,
                    $filter = $('#' + _this.getViewId());
                var event = 'event' + helpersModule.uniqueID();
                this.render(event, 0, collection);
                $.subscribe(event, function (e, data) {
                    $filter.replaceWith(data.text);
                    $.unsubscribe(event);
                })
            },
            initialize: function () {
                this.set('key', this.get('filter').getName());
            },
            getAttribute: function () {
                return this.get('filter').getName();
            },
            getCaption: function () {
                return this.get('filter').getCaption();
            },
            /**
             * @returns {String}
             */
            getTooltip: function () {
                return this.get('filter').getTooltipText();
            },
            getValue: function () {
                if (this.get('value')) {
                    return this.get('value');
                }
                return this.getDefaultValue();
            },
            getDefaultValue: function () {
                return this.get('filter').getDefaultValue();
            },
            /**
             * @returns {String}
             */
            getValueFormat: function () {
                return this.get('filter').getValueFormat();
            },
            /**
             *
             * @returns {Deferred}
             */
            runAsyncTaskIsMultiSelect: function () {
                return interpreterModule.runAsyncParseBooleanExpression(this.get('filter').getMultiSelect(), false);
            },
            /**
             *
             * @param {Object} [data]
             * @returns {Deferred}
             */
            runAsyncTaskGetReadProc: function (data) {
                return bindModule.runAsyncTaskBindSql(this.get('filter').getReadProc(), data);
            },
            /**
             *
             * @returns {Deferred}
             */
            runAsyncTaskIsEnabled: function () {
                var isEnabledExpression = this.get('filter').getEnabled();
                if (this.get('value')) {
                    isEnabledExpression = 'true';
                }
                return interpreterModule.runAsyncParseBooleanExpression(isEnabledExpression, true);
            },
            /**
             *
             * @returns {Deferred}
             */
            runAsyncTaskIsVisible: function () {
                return interpreterModule.runAsyncParseBooleanExpression(this.get('filter').getVisible(), true);
            },
            /**
             *
             * @returns {Deferred}
             */
            runAsyncTaskIsNextRow: function () {
                return interpreterModule.runAsyncParseBooleanExpression(this.get('filter').getToNextRow(), false);
            },
            /**
             *
             * @returns {boolean}
             */
            isAutoRefresh: function () {
                return this.getProperties().get('isAutoRefresh');
            },
            getProperties: function () {
                if (this._properties) {
                    return this._properties;
                }
                return new FilterProperties({
                    expression: this.get('filter').getProperties()
                });
            },
            getEventChange: function () {
                return this.get('filter').getEventChange();
            },
            destroy: function () {
                delete this._properties;
                if (this._view) {
                    this._view.destroy();
                    this._view = null;
                }
                this._id = null;
                this.set('model', null);
                this.set('filter', null);
                this.set('id', null);
                this.set('key', null);
                this.set('value', null);
                this.set('$el', null);
            },
            /**
             * @param view {FilterView|null}
             */
            persistLinkToView: function (view) {
                this._view = view;
            }
        });
})(Backbone, helpersModule, FilterProperties, bindModule, deferredModule);