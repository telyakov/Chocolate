/**
 * Log module
 * Dependencies jQuery, log4javascript
 */
var logModule = (function (log4javascript, $) {
    'use strict';
    var log = log4javascript.getLogger();
    log.removeAllAppenders();
    log.addAppender(new log4javascript.BrowserConsoleAppender());
    var _private = {
        error: function (args) {
            log.error(args);
        },
        showMessage: function (msg) {
            $('<div class="notice"></div>')
                .append('<div class="skin"></div>')
                .append($('<div class="content"></div>').html(msg))
                .append('<span class="fa fa-times message-close"></span>')
                .hide()
                .appendTo('#message')
                .fadeIn(1000);
        }
    };
    return {
        error: function (args) {
            _private.error(args);
        },
        showMessage: function (msg) {
            _private.showMessage(msg);
        }
    };
}(log4javascript, jQuery));
