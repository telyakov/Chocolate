/**
 * Log module
 * Dependencies jQuery, log4javascript
 */
var logModule = (function(log4javascript, $) {
    var log = log4javascript.getLogger();
    log.removeAllAppenders();
    log.addAppender(new log4javascript.BrowserConsoleAppender());
    return {
        error: function(args) {
            log.error(args);
        },
        showMessage: function($msg){
            $('#pagewrap').append($msg);
        }
    };
}(log4javascript, jQuery));
