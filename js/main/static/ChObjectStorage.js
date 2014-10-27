var ChObjectStorage = {
    _objectStorage: [],
    /**
     * @param id {string|int}
     * @returns {object|null}
     */
    getByID: function (id) {
        if (typeof this._objectStorage[id] !== 'undefined') {
            return this._objectStorage[id];
        }
        return null;
    },
    /**
     * @param id {string|int}
     * @param chObj {object}
     * @private
     */
    _set: function (id, chObj) {
        this._objectStorage[id] = chObj;
    },
    /**
     *
     * @param $elem
     * @returns {ChTable}
     */
    getChTable: function ($elem) {
        return ChObjectStorage.create($elem, 'ChTable');

    },
    /**
     * @param $elem {jQuery}
     * @returns {ChMap}
     */
    getChMap: function ($elem) {
        return ChObjectStorage.create($elem, 'ChMap');
    },
    /**
     * @param $elem {jQuery}
     * @returns {ChCard}
     */
    getChCard: function ($elem) {
        return ChObjectStorage.create($elem, 'ChCard');
    },
    /**
     * @param $elem {jQuery}
     * @returns {ChTab}
     */
    getChTab: function ($elem) {
        return ChObjectStorage.create($elem, 'ChTab');
    },
    /**
     * @param $elem {jQuery}
     * @returns {ChDynatree}
     */
    getChDynatree: function ($elem) {
        return ChObjectStorage.create($elem, 'ChDynatree');
    },
    /**
     * @param $elem {jQuery}
     * @returns {ChFilterForm}
     */
    getChFilterForm: function ($elem) {
        return ChObjectStorage.create($elem, 'ChFilterForm');
    },
    /**
     * @param $elem {jQuery}
     * @returns {ChGridForm}
     */
    getChGridForm: function ($elem) {
        return ChObjectStorage.create($elem, 'ChGridForm');
    },
    /**
     *
     * @param $el {jQuery}
     * @returns {ChGridColumnBody}
     */
    getChGridColumnBody: function ($el) {
        return ChObjectStorage.create($el, 'ChGridColumnBody');
    },
    /**
     * @param $elem {jQuery}
     * @returns {ChCardElement}
     */
    getChCardElement: function ($elem) {
        return ChObjectStorage.create($elem, 'ChCardElement');
    },
    /**
     * @param $elem {jQuery}
     * @returns {ChMessagesContainer}
     */
    getChMessagesContainer: function ($elem) {
        return ChObjectStorage.create($elem, 'ChMessagesContainer');
    },

    /**
     * @param $elem
     * @param objectClass {string}
     * @returns {object}
     */
    create: function ($elem, objectClass) {
        var id = $elem.attr('id');
        if (!id) {
            $elem.uniqueId();
            id = $elem.attr('id');
        }
        var objInStorage = this.getByID(id);
        if (!objInStorage) {
            try {
                objInStorage = new window[objectClass]($elem);
                this._set(id, objInStorage);
            } catch (e) {
                Chocolate.log.error(
                    'Ошибка при создании и сохранении класса с именем: ' + objectClass,
                    e
                );
            }
        }
        return objInStorage;
    },
    garbageCollection: function () {
        for (var id in this._objectStorage) {
            if (this._objectStorage.hasOwnProperty(id) && !$(Chocolate.idSel(id)).length) {
                if (typeof this._objectStorage[id].destroy === 'function') {
                    this._objectStorage[id].destroy();
                }
                delete this._objectStorage[id];
                delete Chocolate.storage.session[id];
            }
        }

        for (var prop in ChEditableCallback.callbacks) {
            if (ChEditableCallback._hasCallback(prop) && !$(Chocolate.idSel(prop)).length) {
                ChEditableCallback.remove(prop);
            }
        }

    }
};