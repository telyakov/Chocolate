/**
 * Class SelectCardElement
 * @class
 * @augments CardElement
 */
var SelectCardElement = (function ($, helpersModule, CardElement) {
    'use strict';
    return CardElement.extend(
        /** @lends SelectCardElement */
        {
            /**
             * @override
             * @param controlID {String}
             * @param pk {String}
             * @returns {Function}
             * @protected
             */
            _getCallback: function (controlID, pk) {
                var _this = this,
                    column = _this.get('column');
                return function () {
                    column.receiveData()
                        .done(function (res) {
                            var data = helpersModule.prepareSelectSource(res.data),
                                $el = $('#' + controlID),
                                name = column.get('key'),
                                view = _this.get('view'),
                                isAllowEdit = column.isAllowEdit(view, pk);
                            if (isAllowEdit) {
                                $el
                                    .on('save', function (e, params) {
                                        var data = {};
                                        data[name] = params.newValue;
                                        view.model.trigger('change:form', {
                                            op: 'upd',
                                            id: pk,
                                            data: data
                                        });
                                    });
                            }
                            $el
                                .on('init', function () {
                                    var dbData = view.getActualDataFromStorage(pk),
                                        value = dbData ? dbData[name] : '';
                                    if (!isAllowEdit) {
                                        _this._markAsNoChanged($el);
                                    }
                                    setTimeout(function () {
                                        $el.editable('setValue', value);
                                    }, 0);
                                })
                                .on('hidden', function () {
                                    $(this).focus();
                                }).editable({
                                    onblur: 'submit',
                                    name: name,
                                    title: column.getVisibleCaption(),
                                    pk: pk,
                                    disabled: !isAllowEdit,
                                    type: 'select',
                                    mode: 'inline',
                                    validate: function (value) {
                                        _this.validate($(this), value);
                                    },
                                    inputclass: 'chocolate-select',
                                    showbuttons: false,
                                    source: data
                                });
                        });
                };
            }
        });
})(jQuery, helpersModule, CardElement);