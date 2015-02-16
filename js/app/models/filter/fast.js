/**
 * Class FastFilterRO
 * @class
 * @augments FilterRO
 */
var FastFilterRO = (function (FilterRO, helpersModule, optionsModule, deferredModule) {
    'use strict';
    return FilterRO.extend(
        /** @lends FastFilterRO */
        {
            _data: null,
            /**
             * @method destroy
             */
            destroy: function () {
                delete this._data;
                this.constructor.__super__.destroy.apply(this, arguments);
            },
            /**
             * @param forceRefresh {Boolean}
             * @returns {Deferred}
             */
            startAsyncTaskGetData: function (forceRefresh) {
                var deferred = deferredModule.create(),
                    _this = this;
                if (this._data === null || forceRefresh) {
                    this.runAsyncTaskGetReadProc()
                        .done(function (data) {
                            var sql = data.sql,
                                helpersDefer = deferredModule.create(),
                                helpDeferId = deferredModule.save(helpersDefer);
                            mediator.publish(optionsModule.getChannel('socketRequest'), {
                                query: sql,
                                type: optionsModule.getRequestType('deferred'),
                                id: helpDeferId
                            });
                            helpersDefer.done(function (res) {
                                _this._data = res;
                                deferred.resolve(res);
                            });
                        });
                } else {
                    deferred.resolve(this._data);
                }
                return deferred;
            },
            /**
             * @param event {String}
             * @param i {int}
             * @param collection {FiltersROCollection}
             */
            render: function (event, i, collection) {
                var view = new FastFilterView({
                    model: this,
                    form: this.get('model'),
                    view: this.get('view'),
                    id: this.getViewId(),
                    $el: this.get('$el')

                });
                this.persistLinkToView(view);
                view.render(event, i, collection);
            }
        });
})(FilterRO, helpersModule, optionsModule, deferredModule);