/**
 * Class TreeCardElement
 * @class
 * @augments CardElement
 */
var TreeCardElement = (function ($, helpersModule, undefined, CardElement) {
    'use strict';
    return CardElement.extend(
        /** @lends TreeCardElement */

        {
            _$element: null,
            /**
             * @method destroy
             * @override
             */
            destroy: function () {
                if (this._$element) {
                    this._$element.off('init').off('click').editable('destroy').remove();
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
                            var data = helpersModule.prepareTreeSource(res.data),
                                $el = $('#' + controlID),
                                name = column.get('key'),
                                viewProperty = _this.get('view'),
                                isAllowEdit = column.isAllowEdit(viewProperty, pk);
                            _this._persistLinkToEditableElements($el);
                            if (isAllowEdit) {
                                $el.on('click', function () {
                                    //todo: leak memory
                                    var model = new DynatreeModel({
                                        $el: $el
                                    });
                                    var view = new FormDynatreeView({
                                        model: model,
                                        dataModel: viewProperty.model
                                    });
                                    view.render(column.isSingle(), _this.getCaption(), name, pk);
                                });
                            }
                            $el.on('init', function () {
                                var dbData = viewProperty.getActualDataFromStorage(pk),
                                    value = dbData ? dbData[name] : '',
                                    text = dbData ? dbData[column.getFromKey()] : '';
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
})(jQuery, helpersModule, undefined, CardElement);