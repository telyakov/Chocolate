var MultimediaCardElement = (function () {
    'use strict';
    return CardElement.extend({
        getMinHeight: function () {
            return 300;
        },
        isStatic: function () {
            return false;
        },
        renderBeginData: function () {
            return '<div class="card-input card-grid' + this.getEditClass() + '">';
        },
        renderControl: function (pk, controlID, tabindex) {
            return  '<div class="card-multimedia" id=' + controlID+ '></div>';
        },
        getCallback: function (controlID, pk) {
            var column = this.get('column'),
                model = this.get('model');
            return function () {
                var sql = column.getSql();
                var defer = deferredModule.create(),
                    deferID = deferredModule.save(defer);
                bindModule.deferredBindSql(deferID, sql, model.getParamsForBind(pk));
                defer.done(function (res) {
                    var prepareSql = res.sql;
                    chCardFunction.multimediaInitFunction(prepareSql, controlID);
                });

            };
        }

    });
})();