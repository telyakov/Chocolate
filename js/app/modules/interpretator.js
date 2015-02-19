var interpreterModule = (function (optionsModule) {
    'use strict';
    var methods = {
        'dataform.defvalues': 'dataform.defvalues',
        'this.val': 'this.val',
        'this.caption': 'this.caption',
        'dataform.refreshdata': 'dataform.refreshdata'
    };
    var SCRIPT_ID = 'script',
        COMMAND_DELIMITER = ';',
        _private = {
            /**
             *
             * @param {string} expression
             * @returns {boolean}
             */
            isScript: function (expression) {
                return expression.toLowerCase().indexOf(SCRIPT_ID) === 0;
            },
            /**
             *
             * @param {string} expression
             * @returns {string[]}
             */
            parseScriptCommands: function (expression) {
                var prefixLen = SCRIPT_ID.length;
                return expression.substr(prefixLen).split(COMMAND_DELIMITER);
            },
            /**
             *
             * @param {String} key
             * @returns {String}
             */
            getMethod: function (key) {
                return methods[key];
            }
        };

    return {
        /**
         * @desc run async parsing script and perform his actions
         * @param {String} expression
         * @param {FilterView} view
         */
        runAsyncParseScript: function (expression, view) {
            if (_private.isScript(expression)) {
                var formModel = view.getFormModel(),
                    val = view.getModel().get('value');
                _private.parseScriptCommands(expression)
                    .forEach(
                    /**
                     *
                     * @param {string} token
                     */
                        function (token) {
                        var command = $.trim(token).toLowerCase(),
                            defaultValuesMethod = _private.getMethod('dataform.defvalues');
                        switch (true) {
                            case command === _private.getMethod('dataform.refreshdata'):
                                formModel.trigger('refresh:form', {isLazy: true});
                                break;
                            case command.indexOf(defaultValuesMethod) === 0:
                                var args = command.substr(defaultValuesMethod.length + 1),
                                    tokens = args.split('='),
                                    key = $.trim(tokens[0]),
                                    value = $.trim(tokens[1]);
                                if (value === _private.getMethod('this.val')) {
                                    formModel.setDynamicDefaultValue(key, val);
                                } else if (value === _private.getMethod('this.caption')) {
                                    view.runAsyncTaskGetCurrentValue()
                                        .done(
                                        /** @param {ValueResponse} res */
                                            function (res) {
                                            var value = res.value;
                                            formModel.setDynamicDefaultValue(key, value);
                                        }).
                                        fail(function(error){
                                            mediator.publish(optionsModule.getChannel('logError'),{
                                                error: error
                                            })
                                        })
                                }
                                break;
                            default:
                                break;
                        }
                    });
            }
        }
    }
})(optionsModule);
