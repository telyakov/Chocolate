/**
 * Class FormColumnRO
 * @class
 * @augments ColumnRO
 */
var FormColumnRO = (function () {
    'use strict';
    return ColumnRO.extend(
        /** @lends FormColumnRO */
        {
        /**
         * @override
         * @returns {string}
         */
        getClass: function () {
            var className = 'grid-button';
            if (!this.isEdit()) {
                className += ' not-changed';
            }
            return className;
        },
        /**
         * @override
         * @returns {Function}
         */
        getJsFn: function () {
            var _this = this;
            return function ($cnt) {
                $cnt.find('.' + _this._getUniqueClass())
                    .editable({
                        mode: 'inline',
                        name: _this.get('key'),
                        showbuttons: false,
                        onblur: 'submit',
                        disabled: true,
                        type: 'text',
                        title: _this.getVisibleCaption(),
                        view: _this.getView(),
                        fromID: _this.getFromId(),
                        fromName: _this.getFromName(),
                        toName: _this.getToName(),
                        toID: _this.getToId()
                    })
                ;
            };
        }
    });
})();