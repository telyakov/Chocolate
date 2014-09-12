var ChCardInitCallback = {
    callbacks: $.Callbacks(''),
    /**
     * @param $context {jQuery}
     */
    fireOnce: function ($context) {
        this.callbacks.fire($context);
        this._clear();
    },
    _clear: function () {
        this.callbacks.empty();
    },
    /**
     * @param callback {function}
     */
    add: function (callback) {
        this.callbacks.add(callback);
    }
};
