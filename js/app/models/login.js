var LoginModel = (function () {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            login: null,
            password: null
        },
        login: function () {
            var _this = this;
            socketModule
                .login(this.get('login'), this.hashIdentity())
                .done(function(res){
                    if(res.success){
                            facade.startApp(res.userID, res.userName, res.epmloyeeID);
                    }else{
                        storageModule.persistIdentity('');
                        _this.fire('login:error', 'Неправильные логин или пароль.');
                    }
                })
                .fail(function(error){
                    _this.fire('login:error', error);
                });
        },
        hashIdentity: function () {
            var token = socketModule.getToken(),
                login = this.get('login'),
                password = this.get('password');

            var identity = [login, password].join('&'),
                shaIdentityObj = new jsSHA(identity, "TEXT"),
                hexIdentity = shaIdentityObj.getHash("SHA-256", "HEX");

            var fullIdentity = [hexIdentity, token].join('&');
            var shaFullIdentityObj = new jsSHA(fullIdentity, "TEXT");

            return shaFullIdentityObj.getHash("SHA-256", "HEX");
        }
    });
})();
