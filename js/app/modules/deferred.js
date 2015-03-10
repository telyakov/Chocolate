//Вспомогательный модуль, для запуска асинхронных задач, требует уникального id

var deferredModule = (function($){
    'use strict';
    var heap = [],
        counter = 0;

    return{
        /**
         *
         * @returns {Deferred}
         */
        create: function(){
            return $.Deferred();
        },
        /**
         *
         * @param {Deferred} deferred
         * @returns {number}
         */
        save: function(deferred){
            counter +=1;
            heap[counter] = deferred;
            return counter;
        },
        /**
         *
         * @param {Number} id
         * @returns Deferred
         */
        pop: function(id){
            var obj = heap[id];
            delete heap[id];
            return obj;
        }
    };
})(jQuery);