var filesModule = (function (undefined) {
    'use strict';
    var files = [],
        errors = [],
        _private = {
            hasErrors: function (id) {
                return _private.isSetError(id) && errors[id].length > 0;
            },
            pushError: function (id, error) {
                if (!_private.isSetError(id)) {
                    errors[id] = [];
                }
                errors[id].push(error);
            },
            clearErrors: function (id) {
                delete errors[id];
            },
            isSetError: function (id) {
                return errors[id] !== undefined;
            },
            /**
             * @param id {string}
             * @param file {*}
             */
            push: function (id, file) {
                if (!_private.isSet(id)) {
                    files[id] = [];
                }
                files[id].push(file);
            },
            /**
             * @param id {string}
             * @returns {boolean}
             */
            isSet: function (id) {
                return files[id] !== undefined;
            },
            /**
             * @param id {string}
             */
            clear: function (id) {
                delete files[id];
            },
            /**
             * @param id {string}
             * @returns {boolean}
             */
            isNotEmpty: function (id) {
                return _private.isSet(id) && files[id].length > 0;
            },
            /**
             * @param id {string}
             * @returns {boolean}
             */
            isEmpty: function (id) {
                return !_private.isNotEmpty(id);
            },
            /**
             * @param id {string}
             * @returns {object|null}
             */
            pop: function (id) {
                if (_private.isNotEmpty(id)) {
                    return files[id].pop();
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
})(undefined);