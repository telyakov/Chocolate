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
        /**
         *
         * @param {...*} args
         */
        error: function (args) {
            log.error(args);
        },
        /**
         *
         * @param {string} msg
         */
        showMessage: function (msg) {
            var $message = $('<div class="notice"></div>')
                .append('<div class="skin"></div>')
                .append($('<div class="content"></div>').html(msg))
                .append('<span class="fa fa-times message-close"></span>')
                .hide()
                .appendTo('#message')
                .fadeIn(1000);
            setTimeout(function () {
                $message.fadeOut(1000);
            }, 20000)
        }
    };
    return {
        /**
         *
         * @param {...*} args
         */
        error: function (args) {
            _private.error(args);
        },
        /**
         *
         * @param {string} msg
         */
        showMessage: function (msg) {
            _private.showMessage(msg);
        }
    };
}(log4javascript, jQuery));
