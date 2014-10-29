var factoryModule = (function () {
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
         * @returns {ChTable}
         */
        makeChTable: function ($el) {
            return _private.make($el, 'ChTable');
        },
        /**
         * @returns {ChMap}
         */
        makeChMap: function ($el) {
            return _private.make($el, 'ChMap');
        },
        /**
         * @returns {ChCard}
         */
        makeChCard: function (el) {
            return _private.make(el, 'ChCard');
        },
        /**
         * @returns {ChTab}
         */
        makeChTab: function ($el) {
            return _private.make($el, 'ChTab');
        },
        /**
         * @returns {ChDynatree}
         */
        makeChDynatree: function ($el) {
            return _private.make($el, 'ChDynatree');
        },
        /**
         * @returns {ChFilterForm}
         */
        makeChFilterForm: function ($el) {
            return _private.make($el, 'ChFilterForm');
        },
        /**
         * @returns {ChGridForm}
         */
        makeChGridForm: function ($el) {
            return _private.make($el, 'ChGridForm');
        },
        /**
         * @returns {ChGridColumnBody}
         */
        makeChGridColumnBody: function ($el) {
            return _private.make($el, 'ChGridColumnBody');
        },
        /**
         * @returns {ChCardElement}
         */
        makeChCardElement: function ($el) {
            return _private.make($el, 'ChCardElement');
        },
        /**
         * @returns {ChMessagesContainer}
         */
        makeChMessagesContainer: function ($el) {
            return _private.make($el, 'ChMessagesContainer');
        },
        /**
         * @returns {ChFilter}
         */
        makeChFilter: function ($el) {
            return _private.make($el, 'ChFilter');
        },
        /**
         * @returns {ChCanvas}
         */
        makeChCanvas: function ($el) {
            return _private.make($el, 'ChCanvas');
        },
        /**
         * @returns {ChGridColumnHeader}
         */
        makeChGridColumnHeader: function ($el) {
            return _private.make($el, 'ChGridColumnHeader');
        },
        /**
         * @returns {ChDiscussionForm}
         */
        makeChDiscussionForm: function ($el) {
            return _private.make($el, 'ChDiscussionForm');
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
                    mediator.publish(facade.getOptionsModule().getChannel('logError'),
                        'Не удалось создать ' + objClass,
                        e
                    );
                }
            }
            return objInStorage;
        },
        garbageCollection: function () {
            var id, hasOwn = Object.prototype.hasOwnProperty;
            for (id in _private.storage) {
                if (hasOwn.call(_private.storage, id) && !$('#' + id).length) {
                    if (typeof _private.storage[id].destroy === 'function') {
                        _private.storage[id].destroy();
                    }
                    delete _private.storage[id];
                    delete Chocolate.storage.session[id];
                }
            }
            var prop;
            for (prop in ChEditableCallback.callbacks) {
                if (ChEditableCallback._hasCallback(prop) && !$(Chocolate.idSel(prop)).length) {
                    ChEditableCallback.remove(prop);
                }
            }

        }
    };
    return {
        makeChTable: function ($el) {
            return _private.makeChTable($el);
        },
        makeChMap: function ($el) {
            return _private.makeChMap($el);
        },
        makeChCard: function ($el) {
            return _private.makeChCard($el);
        },
        makeChTab: function ($el) {
            return _private.makeChTab($el);
        },
        makeChDynatree: function ($el) {
            return _private.makeChDynatree($el);
        },
        makeChFilterForm: function ($el) {
            return _private.makeChFilterForm($el);
        },
        makeChGridForm: function ($el) {
            return _private.makeChGridForm($el);
        },
        makeChGridColumnBody: function ($el) {
            return _private.makeChGridColumnBody($el);
        },
        makeChCardElement: function ($el) {
            return _private.makeChCardElement($el);
        },
        makeChMessagesContainer: function ($el) {
            return _private.makeChMessagesContainer($el);
        },
        makeChFilter: function ($el) {
            return _private.makeChFilter($el);
        },
        makeChCanvas: function ($el) {
            return _private.makeChCanvas($el);
        },
        makeChGridColumnHeader: function ($el) {
            return _private.makeChGridColumnHeader($el);
        },
        makeChDiscussionForm: function ($el) {
            return _private.makeChDiscussionForm($el);
        },

        garbageCollection: function () {
            _private.garbageCollection();
        }
    };
})();