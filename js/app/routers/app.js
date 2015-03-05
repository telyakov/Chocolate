var AppRouter = (function () {
    'use strict';
    return Backbone.Router.extend({
        routes: {
            '': 'index',
            'login': 'login',
            'forgotPassword': 'forgotPassword'
        },
        index: function () {
            socketModule.connect(this);
        },
        login: function () {
            console.log('login')
            var model = new LoginModel(),
                view = new LoginForm({
                    model: model
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