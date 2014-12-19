var FastFilterRO = (function (FilterRO, helpersModule, optionsModule) {
    'use strict';
    return FilterRO.extend({
        dataEval: function (deferId) {
            var defer = this.readProcEval();
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
                form: this.get('model'),
                id: helpersModule.uniqueID(),
                $el: $('body')

            });
            view.render(event, i, collection);
        }
    });
})(FilterRO, helpersModule, optionsModule);