var filesModule = (function () {
    'use strict';
    var _private = {
        files: [],
        errors: [],
        hasErrors: function (id) {
            return this.isSetError(id) && this.errors[id].length > 0;
        },
        pushError: function (id, error) {
            if (!this.isSetError(id)) {
                this.errors[id] = [];
            }
            this.errors[id].push(error);
        },
        clearErrors: function (id) {
            delete this.errors[id];
        },
        isSetError: function (id) {
            return typeof this.errors[id] !== 'undefined';
        },
        /**
         * @param id {string}
         * @param file {*}
         */
        push: function (id, file) {
            if (!this.isSet(id)) {
                this.files[id] = [];
            }
            this.files[id].push(file);
        },
        /**
         * @param id {string}
         * @returns {boolean}
         */
        isSet: function (id) {
            return typeof this.files[id] !== 'undefined';
        },
        /**
         * @param id {string}
         */
        clear: function (id) {
            delete this.files[id];
        },
        /**
         * @param id {string}
         * @returns {boolean}
         */
        isNotEmpty: function (id) {
            return this.isSet(id) && this.files[id].length > 0;
        },
        /**
         * @param id {string}
         * @returns {boolean}
         */
        isEmpty: function (id) {
            return !this.isNotEmpty(id);
        },
        /**
         * @param id {string}
         * @returns {object|null}
         */
        pop: function (id) {
            if (this.isNotEmpty(id)) {
                return this.files[id].pop();
            }
            return null;
        }
    };

    return{
        isNotEmpty: function (id) {
            return _private.isNotEmpty(id);
        },
        clear: function (id) {
            _private.clear(id);
        },
        pop: function (id) {
            return _private.pop(id);
        },
        hasErrors: function (id) {
            return _private.hasErrors(id);
        },
        clearErrors: function (id) {
            _private.clearErrors(id);
        },
        pushError: function (id, er) {
            _private.pushError(id, er);
        },
        push: function (id, file) {
            _private.push(id, file);
        }
    };
})();