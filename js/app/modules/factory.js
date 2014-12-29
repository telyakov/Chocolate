/**
 * Factory module
 */
var factoryModule = (function ($, window, optionsModule, mediator) {
    'use strict';
    var _private = {
        storage: [],
        getByID: function (id) {
            if (typeof _private.storage[id] !== 'undefined') {
                return _private.storage[id];
            }
            return null;
        },
        _set: function (id, obj) {
            _private.storage[id] = obj;
        },
        /**
         * @returns {ChTab}
         */
        makeChTab: function ($el) {
            return _private.make($el, 'ChTab');
        },
        make: function ($el, objClass) {
            var id = $el.attr('id');
            if (!id) {
                $el.uniqueId();
                id = $el.attr('id');
            }
            var objInStorage = _private.getByID(id);
            if (!objInStorage) {
                try {
                    objInStorage = new window[objClass]($el);
                    _private._set(id, objInStorage);
                } catch (e) {
                    mediator.publish(optionsModule.getChannel('logError'),
                        'Не удалось создать ' + objClass,
                        e
                    );
                }
            }
            return objInStorage;
        },
        isGarbage: function(id){
            return $('#' + id).length === 0;
        },
        garbageCollection: function () {
            var id, hasOwn = Object.prototype.hasOwnProperty;
            for (id in _private.storage) {
                if (hasOwn.call(_private.storage, id) && _private.isGarbage(id)) {
                    if (typeof _private.storage[id].destroy === 'function') {
                        _private.storage[id].destroy();
                    }
                    delete _private.storage[id];
                }
            }
        }
    };
    return {
        makeChTab: function ($el) {
            return _private.makeChTab($el);
        },
        garbageCollection: function () {
            _private.garbageCollection();
        }
    };
})(jQuery, window, optionsModule, mediator);