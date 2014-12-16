var TreeCardElement = (function () {
    'use strict';
    return CardElement.extend({
        getCallback: function (controlID, pk) {
            var _this = this,
                column = _this.get('column');
            return function () {
                //todo: поддержка выбора дочерней сетки
                var defer = column.evalReadProc();
                defer.done(function (res) {
                    var data = helpersModule.prepareTreeSource(res.data);
                    var $el = $('#' + controlID);
                    var name = column.get('key'),
                        rawEdit = column.getRawAllowEdit(),
                        caption = column.getVisibleCaption();
                    $el.on('init', function (e, editable) {
                        ch.card.treeView.defaultInit($(this), name, rawEdit, name, editable, caption, column.isSingle());
                    })
                        .editable({
                            name: name,
                            title: '',
                            pk: pk,
                            type: 'text',
                            mode: 'modal',
                            source: data,
                            showbuttons: false,
                            validate: function (value) {
                                chCardFunction.defaultValidateFunc($(this), value);
                            }
                        });
                });
            };
        }
    });
})();