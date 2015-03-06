var LoginForm = (function () {
    'use strict';
    return Backbone.View.extend({
        template: _.template([
                '<div id="login-container">',
                '<section class="center">',
                '<header>',
                '<div>',
                '<div>',
                '<a>Шоколад</a> <i class="icon-ellipsis-vertical"></i>',
                '</div>',
                '</div>',
                '</header>',
                '<div class="form">',
                '<form class="form-horizontal" id="login-form" method="post">',
                '<div class="title">Войти</div>',
                '<div class="separator"></div>',
                '<div class="form-group"><label class="col-sm-3 control-label" for="ch-user-login">Логин</label><div class="col-sm-9">',
                '<input class="form-control" placeholder="Логин" id="ch-user-login" type="text"></div></div>',
                '<div class="form-group"><label class="col-sm-3 control-label" for="ch-user-password">Пароль</label><div class="col-sm-9">',
                '<input class="form-control" placeholder="Пароль" id="ch-user-password" type="password"></div></div>',
                '<a href="#forgotPassword" title="Забыли пароль?" data-id="forgot-password">Забыли пароль?</a>',
                '<div class="form-actions">',
                '<input type="submit" id="ch-login" value="Войти">    </div>',
                '</form></div><!-- form -->    </section>',
                '</div>'
            ].join('')
        ),
        events: {
            'click #ch-login': function(e){
                console.log(e);
                var login =  $('#ch-user-login').val();
                var password =  $('#ch-user-password').val();
                var model = this.model;
                model.set('login', login);
                model.set('password', password);
                model.login();
                //return false
                e.preventDefault();
            }
        },
        initialize: function (options) {
            _.bindAll(this);
            this.$el = options.$el;
        },
        render: function () {
            console.log(this.$el)
            this.$el.html(this.template());
        }
    });
})();