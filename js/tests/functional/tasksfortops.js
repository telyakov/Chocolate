var webdriverjs = require('../../../protected/node_modules/webdriverjs/index'),
    assert = require('assert');

var options = { desiredCapabilities: { browserName: 'phantomjs' } };

describe('Chocolate', function () {

    this.timeout(99999999);
    var client = {};
    before(function (done) {
        client = webdriverjs.remote(options);
        client.init(done);
    });

    it('Login page', function (done) {
        client
            .url('http://localhost')
            .getTagName('#login-form', function (err, tagName) {
                assert(err === null, 'Получение тега формы');
                assert('form' === tagName, 'Форма авторизации присутствует на странице');
            })
            .addValue('#LoginForm_username', 'Целищев', function (err) {
                assert(err === null, 'Ввод логина');
            })
            .addValue('#LoginForm_password', 'четверг', function (err) {
                assert(err === null, 'Ввод пароля');
            })
            .submitForm('#login-form', function (err) {
                assert(err === null, 'Авторизация');
            })
            .call(done);
    });
    it('Task form', function (done) {
        client
            .waitFor('.grid-view', 10000, function (err) {
                assert(err === null, 'Автоматически открылись поручения');
            })
            .doubleClick('.card-button', function(err){
                assert(err === null, 'Открываем карточку');
            })
            .doubleClick('.card-button', function(err){
                assert(err === null, 'Открываем карточку');
            })
            .waitFor('.card-content',10000, function(err){
                assert(err === null, '.card-content not present in open card');
            })
            .click('[data-id=Вложения] a', function(err){
                assert(err === null, 'Открываем закладку вложения');
            })
            .waitFor('[data-id="framework/attachments/attachments.xml"]', 10000, function(err){
                assert(err === null, 'Закладка вложения открылась');
            })
            .click('[data-id=Журнал] a', function(err){
                assert(err === null, 'Открываем закладку Журнал');
            })
            .waitFor('[data-id="log.xml"]', 10000, function(err){
                assert(err === null, 'Закладка Журнал открылась');
            })
            .click('[data-id="Служебные параметры"] a', function(err){
                assert(err === null, 'Открываем закладку Служебные параметры');
            })
            .waitFor('a[rel^=lastmodifydate]', 10000, function(err){
                assert(err === null, 'Закладка Служебные параметры открылась');
            })
            .call(done);
    });
    after(function (done) {
        client.end(done);
    });
});