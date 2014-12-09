var phoneModule = (function (optionsModule, userModule, bindModule, mediator) {

    var _private = {
        makeCall: function (to) {

            var data = {
                userid: userModule.getID(),
                phoneto: to
            };

            var sqlDefer = deferredModule.create(),
                sqlDeferID = deferredModule.save(sqlDefer);
            bindModule.deferredBindSql(sqlDeferID, optionsModule.getSql('makeCall'), data);
            sqlDefer.done(function (data) {
                var sql = data.sql;
                console.log(sql);
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