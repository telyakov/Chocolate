var phoneModule = (function (optionsModule, userModule, bindModule, mediator) {

    var _private = {
        makeCall: function (to) {

            var data = {
                userid: userModule.getID(),
                phoneto: to
            };

            bindModule.
                runAsyncTaskBindSql(optionsModule.getSql('makeCall'), data)
                .done(function (data) {
                    var sql = data.sql;
                    mediator.publish(optionsModule.getChannel('socketRequest'), {
                        query: sql
                    });
                });
        }
    };
    return {
        makeCall: function (to) {
            _private.makeCall(to);

        }
    };
})(optionsModule, userModule, bindModule, mediator);