var PrintActions = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        KEYS_DELIMITER: ' ',
        ACTION_DELIMITER: '|',
        TITLE_DELIMITER: '=',
        defaults: {
            printActionsXml: null
        },
        getActions: function () {
            var actions = [];
            var text = this.get('printActionsXml');
            if (text) {
                actions = this.parse(text);
            }
            return actions;
        },
        parse: function (text) {
            var _this = this,
                result = [],
                actions = text.split(this.ACTION_DELIMITER);
            actions.forEach(function (action) {
                var index = action.indexOf(_this.TITLE_DELIMITER);
                if (index !== -1) {
                    var title = $.trim(action.substring(0, index)),
                        cmd = $.trim(action.substr(index + _this.TITLE_DELIMITER.length));
                    result.push({
                        title: title,
                        cmd: cmd
                    });
                }
            });
            return result;
        }
    });
})(Backbone);
