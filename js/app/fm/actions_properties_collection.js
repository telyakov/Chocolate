var ActionsPropertiesCollection = (function (Backbone) {
    'use strict';
    return Backbone.Collection.extend({
        model: ActionProperties,
        getData: function(){
            var result = []
            this.each(function(action){
                result.push({
                   title: action.getCaption(),
                    cmd: action.getAction()
                });
            });
            result.push({
                title: 'Экспорт в Excel',
                cmd: 'ch.export2excel'
            });
            result.push({
                title: 'Настройка',
                cmd: 'ch.settings'
            });
            return result;
        }
    });
})(Backbone);