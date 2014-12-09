var FastFilterRO = (function (FilterRO, helpersModule, optionsModule) {
    'use strict';
    return FilterRO.extend({
        dataEval: function (deferId) {
            var defer = deferredModule.create(),
                deferID = deferredModule.save(defer);
            this.readProcEval(deferID);
            defer.done(function (data) {
                var sql = data.sql;
                mediator.publish(optionsModule.getChannel('socketRequest'), {
                    query: sql,
                    type: optionsModule.getRequestType('deferred'),
                    id: deferId
                });
            });
        },
        render: function (event, i, collection) {
            var view = new FastFilterView({
                model: this,
                id: helpersModule.uniqueID(),
                $el: $('body')

            });
            view.render(event, i, collection);
        }
    });
})(FilterRO, helpersModule, optionsModule);