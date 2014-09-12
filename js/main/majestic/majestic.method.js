/**
 * Абстрактныый метод для метода CoreScript
 * @param code
 * @param ch_form {ChGridForm}
 * @constructor
 */
function MajesticMethod(code, ch_form) {
    this.code = code;
    this.ch_form = ch_form;
    this.set_expression_separator = '=';
    this.params_separator = ' ';
    this.params_prefix = '@';

};
MajesticMethod.prototype = {
    run: function () {
        throw "Необходимо реализовать функцию run для метода";
    },
    getParams: function () {
        var params = this.code.split(this.params_separator);

        //удаляем имя метода
        params.shift();
        return params;
    }

};