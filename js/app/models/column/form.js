var FormColumnRO = (function () {
    'use strict';
    return ColumnRO.extend({
        getClass: function () {
            var className = 'grid-button';
            if (!this.isEdit()) {
                className += ' not-changed';
            }
            return className;
        },
        getJsFn: function () {
            var _this = this;
            return function ($cnt) {
                $cnt.find('.' + _this.getUniqueClass())
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