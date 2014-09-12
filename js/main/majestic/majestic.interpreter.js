/**
 * Интерпретатор core script из vb6(КИС)
 * @param code
 * @param ch_form {ChGridForm}
 * @constructor
 */
function MajesticInterpreter(code, ch_form) {
    this.expressions = [];
    this.code = code;
    this.ch_form = ch_form;
    this.sequence_separator = ';';
}
MajesticInterpreter.prototype = {
    interpret: function () {
        var queue = [],
            ch_from = this.ch_form;
        var expessions = this.code.split(this.sequence_separator);
        expessions.forEach(function (code) {
            var mjExpression = new MajesticExpression(code, ch_from);
            queue.push(mjExpression);

        });
        return queue;
    },
    run: function () {
        var queue = this.interpret();
        while (queue.length > 0) {
            /**
             * @param expression {MajesticExpression}
             */
            var expression = queue.shift();
            expression.run();
        }
    }
};