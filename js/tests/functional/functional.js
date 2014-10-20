/**
 * http://webdriver.io/api.html
 */
var webdriverio = require('../../../protected/node_modules/webdriverio/index'),
    assert = require('assert');

var options = { desiredCapabilities: { browserName: 'phantomjs'}};
describe('Chocolate', function () {

    this.timeout(99999999);
    var client = {};
    before(function (done) {
        client = webdriverio.remote(options);

        client.init(done);
        client.setViewportSize({
            width: 1300,
            height: 900
        });
            });
        it('Login page', function (done) {
            client
                .url('http://localhost')
                .getTagName('#login-form', function (err, tagName) {
                    var success = (err === undefined);
                    if(!success){
                        console.log('Ошибка при открытии формы авторизации: '+ err);
                    }
                    assert(success);

                    var tagExists = ('form' === tagName);
                    if(!tagExists){
                        console.log('Форма для авторизации не найдена');
                    }
                    assert(tagExists);
                })
                .addValue('#LoginForm_username', 'Целищев', function (err) {
                    var success = (err === undefined);
                    if(!success){
                        console.log('Не удалось ввести логин: '+ err);
                    }
                    assert(success);
            })
            .addValue('#LoginForm_password', 'четверг', function (err) {
                var success = (err === undefined);
                if(!success){
                    console.log('Не удалось ввести пароль: '+ err);
                }
                assert(success);            })
            .submitForm('#login-form', function (err) {
                var success = (err === undefined);
                if(!success){
                    console.log('Не удалось отправить форму: '+ err);
                }
                assert(success);
            })
            .call(done);    });
    it('Task form', function (done) {
        client
            .waitFor('.link-form a[href="/grid/index?view=tasks.xml"]', 10000, function (err) {
                var success = (err === undefined);
                if(!success){
                    console.log('Нижнее меню не загрузилось: '+ err);
                }
                assert(success);
            })
            .click('.link-form a[href="/grid/index?view=tasks.xml"]', 5000, function(err){
                var success = (err === undefined);
                if(!success){
                    console.log('Ошибка при клике по поручениям: '+ err);
                }
                assert(success);
            })

            .waitForVisible('.card-button', 10000, function (err) {
                var success = (err === undefined);
                if(!success){
                    console.log('Поручения не открылись: '+ err);
                }
                assert(success);

            })
            .doubleClick('.card-button', function(err){
                var success = (err === undefined);
                if(!success){
                    console.log('Ошибка при попытке открыть карточку: '+ err);
                }
                assert(success);
            })
            .click('[data-id="Основные параметры"] a', function(err){
                var success = (err === undefined);
                if(!success){
                    console.log('Ошибка при открытиии закладки Основные параметры: '+ err);
                }
                assert(success);
            })
            .waitForVisible('.card-content',15000, function(err){
                var success = (err === undefined);
                if(!success){
                    console.log('.card-content not present in open card: '+ err);
                }
                assert(success);
            })
            .click('[data-id="Вложения"] a', function(err){
                var success = (err === undefined);
                if(!success){
                    console.log('Ошибка при открытиии закладки вложений: '+ err);
                }
                assert(success);
            })
            .waitForVisible('[data-id="framework/attachments/attachments.xml"]', 15000, function(err){
                var success = (err === undefined);
                if(!success){
                    console.log('Закладка вложения не открылась: '+ err);
                }
                assert(success);
            })
            .click('[data-id="Журнал"] a', function(err){
                var success = (err === undefined);
                if(!success){
                    console.log('Ошибка при открытиии закладки журнал: '+ err);
                }
                assert(success);

            })
            .waitForVisible('[data-id="log.xml"]', 15000, function(err){
                var success = (err === undefined);
                if(!success){
                    console.log('Закладка журнал не открылась: '+ err);
                }
                assert(success);
            })
            .click('[data-id="Служебные параметры"] a', function(err){
                var success = (err === undefined);
                if(!success){
                    console.log('Ошибка при открытиии закладки Служебные параметры: '+ err);
                }
                assert(success);
            })
            .waitForVisible('a[rel^=lastmodifydate]', 15000, function(err){
                var success = (err === undefined);
                if(!success){
                    console.log('Служебные параметры: '+ err);
                }
                assert(success);
            })
            .call(done);
    });
    after(function (done) {
        client.end(done);
    });
});