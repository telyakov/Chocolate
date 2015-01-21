var FastFilterRO = (function (FilterRO, helpersModule, optionsModule) {
    'use strict';
    return FilterRO.extend({
        _data: null,
        deferData: function (forceRefresh) {
            var dataDefer = deferredModule.create(),
                _this = this;
            if (this._data === null || forceRefresh) {
                this.readProcEval()
                    .done(function (data) {
                        var sql = data.sql;
                        var helpersDefer = deferredModule.create(),
                            helpDeferId = deferredModule.save(helpersDefer);
                        mediator.publish(optionsModule.getChannel('socketRequest'), {
                            query: sql,
                            type: optionsModule.getRequestType('deferred'),
                            id: helpDeferId
                        });
                        helpersDefer.done(function(res){
                            _this._data = res;
                            dataDefer.resolve(res);
                        });
                    });
            }else{
                dataDefer.resolve(this._data);
            }
            return dataDefer;
        },
        _id: null,

        render: function (event, i, collection) {
            var view = new FastFilterView({
                model: this,
                form: this.get('model'),
                view: this.get('view'),
                id: this.getViewId(),
                $el: $('body')

            });
            view.render(event, i, collection);
        }
    });
})(FilterRO, helpersModule, optionsModule);