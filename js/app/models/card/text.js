var TextCardElement = (function () {
    'use strict';
    return CardElement.extend({
        render: function (event) {
            var x = 2,
                y = 3,
                html = 'sdw',
                callback = function(){console.log('call');};
            var response = {
                x: x,
                y: y,
                html: html,
                callback: callback
            };
            $.publish(event, response);
        }
    });
})();