var TextCardElement = (function () {
    'use strict';
    return CardElement.extend({
        getCallback: function(){
            return function(){
                console.log('text');
            };
        }
        //getHtml: function(){
        //    return '';
        //}
    });
})();