var AppRouter = (function () {
    'use strict';
    return Backbone.Router.extend({
        routes: {
            '': 'index',
            'login': 'login',
            'forgotPassword': 'forgotPassword'
        },
        index: function () {
            var asyncTask = deferredModule.create(),
                _this = this;
            asyncTask
                .done(function(res){
                        var restoreConnection = res.restoreConnection;
                        var token = res.token;
                    var login = storageModule.getLogin();
                    console.log(storageModule.getIdentity());
                    if(storageModule.getIdentity()){
                        socketModule
                            .login(login, storageModule.getIdentity())
                            .done(function(res){
                                if(res.success){
                                    if(!restoreConnection){
                                        facade.startApp(res.userID, res.userName, res.epmloyeeID);
                                    }
                                }else{
                                    storageModule.persistIdentity('');
                                    _this.navigate('login',  {trigger: true});
                                }
                            })
                            .fail(function(error){
                                mediator.publish(optionsModule.getChannel('showError'), error);
                            });

                    }else{
                        _this.navigate('login',  {trigger: true});
                    }
                })
                .fail(function(error){
                    mediator.publish(optionsModule.getChannel('showError'), error);
                });
            socketModule.connect(asyncTask);
        },
        login: function () {
            console.log('login')
            var model = new LoginModel(),
                view = new LoginForm({
                    model: model,
                    $el: $('body')
                });
            view.render();
        },
        forgotPassword: function(){
            var model = new LoginModel(),
                view = new ForgotPasswordForm({
                    model: model
                });
            view.render();        }
    });
})();