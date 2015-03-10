///Позвонить из КИС.
var phoneModule = (function (optionsModule, userModule, bindModule) {
    'use strict';
    var _private = {
        /**
         *
         * @param {string} phoneTo
         */
        makeCall: function (phoneTo) {
            var data = {
                userid: userModule.getID(),
                phoneto: phoneTo
            };

            bindModule.
                runAsyncTaskBindSql(optionsModule.getSql('makeCall'), data)
                .done(
                /** @param {SqlBindingResponse} data */
                    function (data) {
                    var sql = data.sql;
                    mediator.publish(optionsModule.getChannel('socketRequest'), {
                        query: sql
                    });
                })
                .fail(function(error){
                    mediator.publish(optionsModule.getChannel('showError'), error);
                });
        }
    };
    return {
        /**
         *
         * @param {string} phoneTo
         */
        makeCall: function (phoneTo) {
            _private.makeCall(phoneTo);

        }
    };
})(optionsModule, userModule, bindModule);