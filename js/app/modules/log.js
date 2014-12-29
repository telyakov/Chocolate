/**
 * Log module
 * Dependencies jQuery, log4javascript
 */
var logModule = (function(log4javascript, $) {
    'use strict';
    var log = log4javascript.getLogger();
    log.removeAllAppenders();
    log.addAppender(new log4javascript.BrowserConsoleAppender());
    var _private = {
        error: function(args){
            log.error(args);
        },
        showMessage: function(msg){
            var $error = $('<div>', {
                id: 'no-internet',
                text: msg
            });
            $('#pagewrap').append($error);
        }
    };
    return {
        error: function(args) {
            _private.error(args);
        },
        showMessage: function(msg){
            _private.showMessage(msg);
        }
    };
}(log4javascript, jQuery));
