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
                '<form class="form-horizontal" id="login-form" action="/site/login" method="post">',
                '<div class="title">Войти</div>',
                '<div class="separator"></div>',
                '<div class="form-group"><label class="col-sm-3 control-label" for="LoginForm_username">Логин</label><div class="col-sm-9"><input class="form-control" placeholder="Логин" name="LoginForm[username]" id="LoginForm_username" type="text"></div></div>    <div class="form-group"><label class="col-sm-3 control-label" for="LoginForm_password">Пароль</label><div class="col-sm-9"><input class="form-control" placeholder="Пароль" name="LoginForm[password]" id="LoginForm_password" type="password"></div></div>',
                '<a href="#forgotPassword" title="Забыли пароль?" data-id="forgot-password">Забыли пароль?</a>',
                '<div class="form-actions">',
                '<input type="submit" name="yt0" value="Войти">    </div>',
                '</form></div><!-- form -->    </section>',
                '</div>'
            ].join('')
        ),
        render: function () {
            $('body').html(this.template());
        }
    });
})();