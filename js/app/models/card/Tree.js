var TreeCardElement = (function ($, helpersModule, undefined) {
    'use strict';
    return CardElement.extend({
        getCallback: function (controlID, pk) {
            var _this = this,
                column = _this.get('column');
            return function () {
                //todo: поддержка выбора дочерней сетки
                column.evalReadProc()
                    .done(function (res) {
                        var data = helpersModule.prepareTreeSource(res.data),
                            $el = $('#' + controlID),
                            name = column.get('key'),
                            view = _this.get('view'),
                            isAllowEdit = column.isAllowEdit(view, pk);
                        if (isAllowEdit) {
                            $el.on('click', function () {
                                var dynatreeElem = new ChDynatree($el),
                                    options = chFunctions.treeViewOptions($el, column.isSingle());
                                options.okButton = ch.card.treeView._okButton();
                                options.defaultValues = function () {
                                    return this.data().editable.value;
                                };
                                dynatreeElem.buildFromData(options);
                            });
                        }
                        $el.on('init', function () {
                            var value = view.getActualDataFromStorage(pk)[name],
                                text = view.getActualDataFromStorage(pk)[column.getFromKey()];
                            if (value === undefined || value === null) {
                                value = '';
                            }
                            setTimeout(function () {
                                $el.editable('setValue', value);
                                $el.text(text);
                            }, 0);
                        })
                            .editable({
                                name: name,
                                title: '',
                                pk: pk,
                                disabled: true,
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
})(jQuery, helpersModule, undefined);