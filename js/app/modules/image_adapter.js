var imageAdapter = (function(){
    'use strict';
    var _private ={
        convert: function(img){
            var cl = _private.imageToCssClass(img);
            if(cl){
                return $('<span>',{
                    'class': cl
                });
            }else{
                return null;
            }

        },
        imageToCssClass: function(img){
            switch (img){
                case 'TaskBig.jpg':
                    return 'fa-tasks';
                default :
                    return null;
            }
        }
    };
    return {
        convert: function(img){
            return _private.convert(img);
        }
    };
})();