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
        processBeforeRender: function () {
            return '';
        },
        getCallback: function (controlID, pk) {
            var column = this.get('column'),
                model = this.get('model');
            return function () {
                var sql = column.getSql();
                var defer = bindModule.deferredBindSql(sql, model.getParamsForBind(pk));
                defer.done(function (res) {
                    var prepareSql = res.sql;
                    chCardFunction.multimediaInitFunction(prepareSql, controlID);
                });

            };
        }

    });
})();