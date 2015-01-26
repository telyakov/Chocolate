var PrintActions = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend(
        /** @lends PrintActions */
        {
            defaults: {
                printActionsXml: null,
                actionDelimiter: '|',
                titleDelimiter: '='
            },
            /**
             * @returns {Array}
             */
            getActions: function () {
                var actions = [],
                    text = this.get('printActionsXml');
                if (text) {
                    actions = this._parse(text);
                }
                return actions;
            },
            /**
             * @param text {String}
             * @returns {Array}
             * @private
             */
            _parse: function (text) {
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
