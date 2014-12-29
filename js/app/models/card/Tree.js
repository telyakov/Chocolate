var TreeCardElement = (function ($, helpersModule, undefined) {
    'use strict';
    return CardElement.extend({
        getCallback: function (controlID, pk) {
            var _this = this,
                column = _this.get('column');
            return function () {
                column.evalReadProc()
                    .done(function (res) {
                        var data = helpersModule.prepareTreeSource(res.data),
                            $el = $('#' + controlID),
                            name = column.get('key'),
                            viewProperty = _this.get('view'),
                            isAllowEdit = column.isAllowEdit(viewProperty, pk);
                        if (isAllowEdit) {
                            var model = new DynatreeModel({
                                $el: $el
                            });
                            var view = new CardDynatreeView({
                                model: model
                            });
                            $el.on('click', function () {
                                view.render($el, column.isSingle(), name, viewProperty);
                            });
                        }
                        $el.on('init', function () {
                            var dbData = viewProperty.getActualDataFromStorage(pk),
                                value = dbData ? dbData[name] : '';
                            var text = dbData ? dbData[column.getFromKey()] : '';
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
                                    _this.validate($(this), value);
                                }
                            });
                    });
            };
        }
    });
})(jQuery, helpersModule, undefined);