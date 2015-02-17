/**
 * Bind module.
 */
var bindModule = (function (userModule, undefined, deferredModule, optionsModule) {
    'use strict';
    var keys = {
            userID: 'userid',
            parentID: 'parentid',
            entityID: 'entityid',
            entityTypeID: 'entitytypeid',
            entityType: 'entitytype'
        },
        _private = {
            /**
             *
             * @param {String} key
             * @returns {RegExp}
             */
            createKeySearch: function (key) {
                var expr = '\'?\\[' + key + '\\]\'?';
                return new RegExp(expr, 'gi');
            },
            /**
             *
             * @returns {RegExp}
             */
            createDataSearch: function () {
                return (/'?\[.*?]'?/gi);
            },
            /**
             *
             * @param {String} sql
             * @returns {Deferred}
             */
            runAsyncTaskGetProcedureParameters: function (sql) {
                var asyncTask = deferredModule.create(),
                    parts = sql.split(' '),
                    rawProc = parts[0],
                    schema,
                    name,
                    separatorIndex = rawProc.indexOf('.');
                if (separatorIndex === -1) {
                    schema = '';
                    name = rawProc;
                } else {
                    schema = rawProc.substring(0, separatorIndex);
                    name = rawProc.substring(separatorIndex + 1);
                }
                if (_private.isSelectSql(name) || parts[1] !== undefined) {
                    asyncTask.resolve({
                        data: null
                    });
                } else {
                    var paramsSql = _private.bind(optionsModule.getSql('getProcParams'), {
                        name: name,
                        schema: schema
                    });
                    mediator.publish(optionsModule.getChannel('socketRequest'), {
                        query: paramsSql,
                        type: optionsModule.getRequestType('deferred'),
                        id: deferredModule.save(asyncTask),
                        isCache: true
                    });
                }
                return asyncTask;
            },
            /**
             *
             * @param {String} sql
             * @param {Object} sqlParams
             * @param {Object} [data]
             * @param {Boolean} [isBindAllParams]
             * @returns {string}
             */
            bindFromSqlParams: function (sql, sqlParams, data, isBindAllParams) {
                var i, param, paramName, newParams = [];

                for (i in sqlParams) {
                    if (sqlParams.hasOwnProperty(i)) {
                        param = sqlParams[i];
                        if (param.parameter_mode === 'IN') {
                            paramName = param.parameter_name.substring(1).toLowerCase();
                            if (paramName === keys.userID) {
                                newParams.push(_private.createSqlForParameter(paramName, userModule.getID()));
                            } else {
                                if (data && data[paramName]) {
                                    var correctVal = _private.escapeQuotes(data[paramName]);
                                    newParams.push(_private.createSqlForParameter(paramName, correctVal));
                                } else if (isBindAllParams) {
                                    newParams.push(_private.createSqlForParameter(paramName, 'NULL'));
                                }
                            }
                        }
                    }
                }
                return sql + newParams.join(',');
            },
            /**
             *
             * @param {string} name
             * @param {string} value
             * @returns {string}
             */
            createSqlForParameter: function (name, value) {
                return ' @' + name + '=' + value;
            },
            /**
             *
             * @param {String} str
             * @returns {String}
             */
            escapeQuotes: function (str) {
                return "'" + str.replace(/'/g, '\'\'') + "'";
            },
            /**
             *
             * @param {String} sql
             * @param {Object} data
             * @returns {String}
             */
            bind: function (sql, data) {
                var search = _private.createDataSearch();
                return sql.replace(search,
                    /**
                     *  @param {String} param
                     *  @returns {String}
                     */
                        function (param) {
                        var lastIndex = param.length - 1;
                        if (param[0] === "'" && param[lastIndex] === "'") {
                            param = param.substring(1, lastIndex);
                        }
                        var property = param.substring(1, lastIndex).toLowerCase();
                        if (data.hasOwnProperty(property)) {
                            return _private.escapeQuotes(data[property]);
                        }
                        return param;
                    });

            },
            /**
             * @param {String} name
             * @returns {boolean}
             */
            isSelectSql: function (name) {
                return name.toLowerCase() === 'select';
            },
            /**
             *
             * @param {Deferred} asyncTask
             * @param {String} sql
             * @param {Object} data
             * @param {boolean} isBindAllParams
             * @returns {Deferred}
             */
            runBindingSqlFromData: function (asyncTask, sql, data, isBindAllParams) {
                _private.runAsyncTaskGetProcedureParameters(sql)
                    .done(
                    /** @param {DeferredResponse} res */
                        function (res) {
                        var sqlParams = res.data, prepareSql;

                        if (_private.isEmptyProcParams(sqlParams)) {
                            prepareSql = _private.bind(sql, data);
                        } else {
                            prepareSql = _private.bindFromSqlParams(sql, sqlParams, data, isBindAllParams);
                        }

                        asyncTask.resolve({
                            sql: prepareSql
                        });
                    })
                    .fail(function (error) {
                        mediator.publish(optionsModule.getChannel('logError'), error);
                        asyncTask.reject(error);
                    });
            },
            /**
             *
             * @param {Object} params
             * @returns {boolean}
             */
            isEmptyProcParams: function (params) {
                return params === null || $.isEmptyObject(params);
            },
            /**
             *
             * @param {Deferred} asyncTask
             * @param {String} sql
             */
            runBindingSql: function (asyncTask, sql) {
                _private.runAsyncTaskGetProcedureParameters(sql)
                    .done(
                    /** @param {DeferredResponse} res */
                        function (res) {
                        var sqlParams = res.data,
                            prepareSql;
                        if (_private.isEmptyProcParams(sqlParams)) {
                            var search = _private.createKeySearch(keys.userID);
                            prepareSql = sql.replace(search, userModule.getID());
                        } else {
                            prepareSql = _private.bindFromSqlParams(sql, sqlParams);
                        }
                        asyncTask.resolve({
                            sql: prepareSql
                        });
                    })
                    .fail(function (error) {
                        mediator.publish(optionsModule.getChannel('logError'), error);
                        asyncTask.reject(error);
                    });
            }
        };
    return {
        /**
         *
         * @param {String} sql
         * @param {Object} [data]
         * @param {boolean} [isBindAllPrams]
         * @returns {Deferred}
         */
        runAsyncTaskBindSql: function (sql, data, isBindAllPrams) {
            var asyncTask = deferredModule.create();
            if (data === undefined) {
                _private.runBindingSql(asyncTask, sql);
            } else {

                if (isBindAllPrams === undefined) {
                    isBindAllPrams = false;
                }
                _private.runBindingSqlFromData(asyncTask, sql, data, isBindAllPrams);
            }
            return asyncTask;
        }
    };
})(userModule, undefined, deferredModule, optionsModule);