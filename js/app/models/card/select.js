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

            _$element: null,
            /**
             * @method destroy
             * @override
             */
            destroy: function () {
                if (this._$element) {
                    this._$element.off('init').off('save').off('hidden').editable('destroy').remove();
                    this._$element = null;
                }
                this.constructor.__super__.destroy.apply(this, arguments);
            },
            /**
             * @param $element {jQuery|null}
             * @private
             * @description for the destruction of unused objects and events
             */
            _persistLinkToEditableElements: function ($element) {
                this._$element = $element;
            },
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
                            _this._persistLinkToEditableElements($el);
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
                                    var dbData = view.model.getActualDataFromStorage(pk),
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