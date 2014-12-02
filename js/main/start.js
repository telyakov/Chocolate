$.tablesorter.addParser({
    id: 'checkbox',
    is: function () {
        return false;
    },
    format: function (s, table, cell) {
        return $(cell).find('a').attr('data-value');
    },
    parsed: false,
    type: 'text'
});
/**
 * for ie lt 8
 */
if (!Object.create) {
    Object.create = (function () {
        function F() {
        }

        return function (o) {
            if (arguments.length != 1) {
                throw new Error('Object.create implementation only accepts one parameter.');
            }
            F.prototype = o;
            return new F();
        };
    })();
}
