var ForgotPasswordForm = (function () {
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
                '<form class="form-horizontal" id="forgot-password-form" action="/site/forgotPassword" method="post">    <div class="title">Восстановление пароля</div>',
                '<div class="separator"></div>',
                '<label for="ClassModules_User_User_email">E-mail</label><input placeholder="yourname@78stroy.ru" name="ClassModules_User_User[email]" id="ClassModules_User_User_email" type="email">    <a href="#login" data-id="forgot-password">На главную</a>    <div class="form-actions">',
                '<input type="submit" name="yt0" value="Выслать">    </div>',
                '</form></div><!-- form -->',
                '</section>',
                '</div>'
            ].join('')
        ),
        render: function () {
            $('body').html(this.template());
        }
    });
})();