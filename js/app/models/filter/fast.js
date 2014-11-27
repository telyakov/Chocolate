var FastFilterRO = (function (FilterRO, helpersModule, optionsModule) {
    'use strict';
    return FilterRO.extend({
        dataEval: function(deferId){
            var sql = this.getReadProc();
            mediator.publish(optionsModule.getChannel('socketRequest'), {
                query: sql,
                type: optionsModule.getRequestType('deferred'),
                id: deferId
            });
        },
        render: function(event, i){
            var view = new FastFilterView({
                model: this,
                id: helpersModule.uniqueID(),
                $el: $('body')

            });
            view.render(event, i);
        }
    });
})(FilterRO, helpersModule, optionsModule);