var deferredModule = (function($){
    var heap = [],
        counter = 0;

    return{
        create: function(){
            return $.Deferred();
        },
        save: function(defer){
            heap[counter] = defer;
            return counter++;
        },
        pop: function(id){
            var obj = heap[id];
            delete heap[id];
            return obj;
        }
    };
})(jQuery);