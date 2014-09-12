/**
 * Объект, сохраняющий все функции обратного вызова для Grid.
 */
var ChEditableCallback = {
    callbacks: [],
    /**
     * @param $context {jQuery}
     * @param id {string|int}
     */
    fire: function ($context, id) {
        if (this._hasCallback(id)) {
            this.callbacks[id].fire($context);
        }
    },
    /**
     * @param id {string|int}
     */
    remove: function (id) {
        if (this._hasCallback(id)) {
            delete this.callbacks[id];
        }
    },
    _hasCallback: function (id) {
        return typeof this.callbacks[id] != 'undefined';
    },
    /**
     * @param callback {function}
     * @param id {string|int}
     */
    add: function (callback, id) {
        if (!this._hasCallback(id)) {
            this.callbacks[id] = $.Callbacks();
        }
        this.callbacks[id].add(callback);
    }
};