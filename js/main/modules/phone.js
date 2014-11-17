var phoneModule = (function (optionsModule, userModule, bindModule, mediator) {

    var _private = {
        makeCall: function (to) {

            var data = {
                    userid: userModule.getID(),
                    phoneto: to
                },
                sql = bindModule.bindSql(optionsModule.getSql('makeCall'), data);

            mediator.publish(optionsModule.getChannel('socketRequest'), {
               query:  sql
            });
        }
    };
    return {
        makeCall: function (to) {
            _private.makeCall(to);

        }
    };
})(optionsModule, userModule, bindModule, mediator);