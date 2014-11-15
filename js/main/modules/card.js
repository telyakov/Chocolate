var cardModule = (function ($) {
    var callbacks = $.Callbacks(''),
        _private = {
            fireOnceCallback: function ($cnt) {
                callbacks.fire($cnt);
                _private.clearCallbacks();
            },
            clearCallbacks: function () {
                callbacks.empty();
            },
            /**
             * @param fn {function}
             */
            addCallback: function (fn) {
                callbacks.add(fn);
            }
        };
    return {
        addCallback: function (fn) {
            _private.addCallback(fn);
        },
        fireOnceCallback: function ($cnt) {
            _private.fireOnceCallback($cnt);
        }
    };
})(jQuery);