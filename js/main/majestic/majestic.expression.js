/**
 * @param ch_form {ChGridForm}
 * @param code
 * @constructor
 */
function MajesticExpression(code, ch_form) {
    this.code = code;
    this.ch_form = ch_form;
}
MajesticExpression.prototype = {
    run: function () {
        var method = MajesticMethodFactory.create(this.code, ch_form);
        method.run();
    }
}