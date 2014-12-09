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
            bindFromData: function (deferId, sql, data) {
                var search = _private.createDataSearch();
                var prepareSql = sql.replace(search, function (param) {
                    var prop = param.substring(1, param.length - 1).toLowerCase();
                    if (data.hasOwnProperty(prop)) {
                        return "'" + data[prop] + "'";
                    }
                    return param;
                });
                deferredModule.pop(deferId).resolve({
                    sql:prepareSql
                });
            },
            bindSql: function (deferId, sql) {
                var search = _private.createKeySearch(keys.userID);
                var prepareSql = sql
                    .replace(search, userModule.getID());

                deferredModule.pop(deferId).resolve({
                    sql:prepareSql
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
        deferredBindSql: function (deferId, sql, data) {
            if (data === undefined) {
                return _private.bindSql(deferId, sql);
            }
            return _private.bindFromData(deferId, sql, data);
        }
    };
})(userModule, undefined);