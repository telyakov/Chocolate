/**
 * Bind module/. Dependencies: userModule.
 */
var bindModule = (function (userModule, undefined) {
    'use strict';
    var keys = {
            userID: 'userid',
            parentID: 'parentid',
            entityID: 'entityid',
            entityTypeID: 'entitytypeid',
            entityType: 'entitytype'
        },
        _private = {
            createKeySearch: function (key) {
                var expr = '\\[' + key + '\\]';
                return new RegExp(expr, 'gi');
            },
            createDataSearch: function () {
                return (/\[.*?\]/g);
            },
            bindCardSql: function (sql, card) {
                var search = _private.createKeySearch,
                    parentID = card.getKey(),
                    entityTypeID = card.getGridForm().getEntityTypeID();
                return sql
                    .replace(search(keys.parentID), parentID)
                    .replace(search(keys.entityID), parentID)
                    .replace(search(keys.entityTypeID), entityTypeID)
                    .replace(search(keys.entityType), entityTypeID);
            },
            evalProcedureParameters: function (sql) {
                var defer = deferredModule.create();
                var parts = sql.split(' '),
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
                if (_private.isSelect(name) || parts[1] !== undefined) {
                    defer.resolve({
                        data: null
                    });
                } else {
                    var paramsSql = _private.bind(optionsModule.getSql('getProcParams'), {
                        name: name,
                        schema: schema
                    });
                    var deferId = deferredModule.save(defer);
                    mediator.publish(optionsModule.getChannel('socketRequest'), {
                        query: paramsSql,
                        type: optionsModule.getRequestType('deferred'),
                        id: deferId
                    });
                }
                return defer;
            },

            bind: function (sql, data) {
                var search = _private.createDataSearch();
                return sql.replace(search, function (param) {
                    var prop = param.substring(1, param.length - 1).toLowerCase();
                    if (data.hasOwnProperty(prop)) {
                        return "'" + data[prop] + "'";
                    }
                    return param;
                });

            },
            isSelect: function (name) {
                return name.toLowerCase() === 'select';
            },
            bindFromData: function (deferId, sql, data, isFull) {
                var defer = _private.evalProcedureParameters(sql);
                defer.done(function (res) {
                    var sqlParams = res.data, prepareSql;
                    if (_private.isEmptyProcParams(sqlParams)) {
                        prepareSql = _private.bind(sql, data);
                    } else {
                        prepareSql = _private.bindFromSqlParams(sql, sqlParams, data, isFull);
                    }
                    deferredModule.pop(deferId).resolve({
                        sql: prepareSql
                    });
                });
            },
            isEmptyProcParams: function (params) {
                return params === null || $.isEmptyObject(params);
            },
            bindFromSqlParams: function (sql, sqlParams, data, isFull) {
                var i, param, paramName, newParams = [];
                for (i in sqlParams) {
                    if (sqlParams.hasOwnProperty(i)) {
                        param = sqlParams[i];
                        if (param.parameter_mode === 'IN') {
                            paramName = param.parameter_name.substring(1).toLowerCase();
                            if (paramName === 'userid') {
                                newParams.push(' @' + paramName + '=' + userModule.getID());
                            } else {
                                if (data && data[paramName]) {
                                    newParams.push(' @' + paramName + '=' + "'" + data[paramName] + "'");
                                }
                            }
                        }
                    }
                }
                return sql + newParams.join(',');
            },
            bindSql: function (deferId, sql) {
                var defer = _private.evalProcedureParameters(sql);
                defer.done(function (res) {
                    var sqlParams = res.data,
                        prepareSql;
                    if (_private.isEmptyProcParams(sqlParams)) {
                        var search = _private.createKeySearch(keys.userID);
                        prepareSql = sql
                            .replace(search, userModule.getID());
                    } else {
                        prepareSql = _private.bindFromSqlParams(sql, sqlParams);
                    }
                    deferredModule.pop(deferId).resolve({
                        sql: prepareSql
                    });
                });
            }
        };
    return {
        /**
         * @param sql {string}
         * @param card {ChCard}
         * @returns {string}
         */
        bindCardSql: function (sql, card) {
            return _private.bindCardSql(sql, card);
        },
        deferredBindSql: function (sql, data, isFull) {
            var defer = deferredModule.create(),
                deferID = deferredModule.save(defer);
            if (data === undefined) {
                _private.bindSql(deferID, sql);
            } else {

                if (isFull === undefined) {
                    isFull = false;
                }
                _private.bindFromData(deferID, sql, data, isFull);
            }
            return defer;
        }
    };
})(userModule, undefined);