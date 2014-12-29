var PrintActions = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            printActionsXml: null,
            actionDelimiter: '|',
            titleDelimiter: '='
        },
        getActions: function () {
            var actions = [],
                text = this.get('printActionsXml');
            if (text) {
                actions = this.parse(text);
            }
            return actions;
        },
        parse: function (text) {
            var result = [],
                actions = text.split(this.get('actionDelimiter')),
                titleDelimiter = this.get('titleDelimiter');

            actions.forEach(function (action) {
                var index = action.indexOf(titleDelimiter);
                if (index !== -1) {
                    var title = $.trim(action.substring(0, index)),
                        cmd = $.trim(action.substr(index + titleDelimiter.length));
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
