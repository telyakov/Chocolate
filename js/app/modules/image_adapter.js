var imageAdapter = (function () {
    'use strict';
    var _private = {
        /**
         *
         * @param {String} imageHref
         * @returns {?jQuery}
         */
        convert: function (imageHref) {
            var cssClass = _private.imageToCssClass(imageHref);
            if (cssClass) {
                return $('<span>', {
                    'class': cssClass
                });
            } else {
                return null;
            }

        },
        /**
         *
         * @param {string} imageHref
         * @returns {string}
         */
        imageToCssClass: function (imageHref) {
            switch (imageHref) {
                case 'TaskBig.jpg':
                    return 'fa-tasks';
                default :
                    return '';
            }
        }
    };
    return {
        /**
         *
         * @param {String} imageHref
         * @returns {?jQuery}
         */
        convert: function (imageHref) {
            return _private.convert(imageHref);
        }
    };
})();