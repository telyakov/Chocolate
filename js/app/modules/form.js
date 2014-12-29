var formModule = (function ($, undefined) {
    'use strict';
    var callbacks = [],
        _private = {
            /**
             * @param $cnt {jQuery}
             * @param id {string|int}
             */
            fireCallbacks: function ($cnt, id) {
                if (_private.hasCallback(id)) {
                    callbacks[id].fire($cnt);
                }
            },
            /**
             * @param id {string|int}
             */
            removeCallbacks: function (id) {
                if (_private.hasCallback(id)) {
                    delete callbacks[id];
                }
            },
            hasCallback: function (id) {
                return callbacks[id] !== undefined;
            },
            /**
             * @param fn {function}
             * @param id {string|int}
             */
            addCallback: function (fn, id) {
                if (!_private.hasCallback(id)) {
                    callbacks[id] = $.Callbacks();
                }
                callbacks[id].add(fn);
            }
        };
    return {
        addCallback: function (fn, id) {
            _private.addCallback(fn, id);
        },
        removeCallbacks: function (id) {
            _private.removeCallbacks(id);

        },
        fireCallbacks: function ($cnt, id) {
            _private.fireCallbacks($cnt, id);
        }
    };
})(jQuery, undefined);