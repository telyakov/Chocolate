var interpreterModule = (function (optionsModule, userModule, deferredModule, bindModule) {
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
            },
            /**
             *
             * @param {string} expression
             * @returns {string}
             */
            prepareExpression: function (expression) {
                return $.trim(expression).toLowerCase();
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
                        var command = _private.prepareExpression(token),
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
                                        fail(function (error) {
                                            mediator.publish(optionsModule.getChannel('logError'), {
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
        },
        /**
         *
         * @param {String} expression
         * @returns {String}
         */
        parseDefaultExpression: function (expression) {
            var prepareExpression = $.trim(expression.toLowerCase());
            switch (true) {
                case prepareExpression === 'currentuserfio':
                    return userModule.getName();
                case prepareExpression === 'userid':
                    return userModule.getID();
                case prepareExpression === 'currentemployeeid':
                    return userModule.getEmployeeID();
                default:
                    return expression;
            }
        },
        /**
         *
         * @param {String} expression
         * @param {Boolean} defaultValue
         * @returns {Deferred}
         */
        runAsyncParseBooleanExpression: function (expression, defaultValue) {
            var task = deferredModule.create(),
                prepareExpr = _private.prepareExpression(expression),
                posEqualSign;
            switch (true) {
                case prepareExpr === 'true':
                    task.resolve({
                        value: true
                    });
                    break;
                case prepareExpr === 'false':
                    task.resolve({
                        value: false
                    });
                    break;
                case prepareExpr.indexOf('sql') === 0:
                    posEqualSign = prepareExpr.indexOf('=');
                    if (posEqualSign === -1) {
                        task.resolve({
                            value: false
                        });
                    } else {
                        var posSql = posEqualSign + 1,
                            sql = $.trim(prepareExpr.substr(posSql));

                        bindModule.runAsyncTaskBindSql(sql)
                            .done(
                            /** @param {SqlBindingResponse} data */
                                function (data) {
                                var sql = data.sql;
                                mediator.publish(optionsModule.getChannel('socketRequest'), {
                                    query: sql,
                                    type: optionsModule.getRequestType('deferred'),
                                    id: deferredModule.save(task)
                                });
                            })
                            .fail(function (error) {
                                task.reject(error);
                            })
                    }
                    break;
                case prepareExpr.indexOf('role') === 0:
                    posEqualSign = prepareExpr.indexOf('=');
                    if (posEqualSign === -1) {
                        task.resolve({
                            value: false
                        });
                    } else {
                        var roleStartPosition = posEqualSign + 1,
                            role = $.trim(prepareExpr.substr(roleStartPosition));
                        task.resolve({
                            value: userModule.hasRole(role)
                        });
                    }
                    break;
                default:
                    task.resolve({
                        value: defaultValue
                    });

            }
            return task;
        },
        /**
         *
         * @param {String} expression
         * @returns {Number|String}
         */
        parseIntExpression: function (expression) {
            if ($.isNumeric(expression)) {
                return parseInt(expression, 10);
            } else {
                return expression;
            }
        },
        /**
         *
         * @param {String} expression
         * @param {Boolean} defaultValue
         * @returns {Boolean}
         */
        parseBooleanExpression: function (expression, defaultValue) {
            var prepareExpression = _private.prepareExpression(expression);
            switch (true) {
                case prepareExpression === 'true':
                    return true;
                case prepareExpression === 'false':
                    return false;
                default:
                    return defaultValue;
            }
        }

    }
})(optionsModule, userModule, deferredModule, bindModule);
