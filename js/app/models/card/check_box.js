/**
 * Class CheckBoxCardElement
 * @class
 * @augments CardElement
 */
var CheckBoxCardElement = (function ($, helpersModule, CardElement) {
    'use strict';
    return CardElement.extend(
        /** @lends CheckBoxCardElement */
        {
            _$element: null,
            /**
             * @method destroy
             * @override
             */
            destroy: function () {
                if (this._$element) {
                    this._$element.off('click').off('init').off('hidden').editable('destroy').remove();
                    this._$element = null;
                }
                this.constructor.__super__.destroy.apply(this, arguments);
            },
            /**
             * @override
             */
            showError: function () {
              if(this._$element){
                  this._$element
                      .closest('.card-col')
                      .children('label')
                      .addClass('card-error');
              }
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
                    column = _this.getColumn(),
                    customProperties = column.getColumnCustomProperties();
                return function () {
                    var name = column.get('key'),
                        view = _this.get('view'),
                        isAllowEdit = column.isAllowEdit(view, pk),
                        $this = $('#' + controlID);
                    _this._persistLinkToEditableElements($this);
                    if (isAllowEdit) {
                        $this
                            .on('click', function () {
                                var val = $this.editable('getValue');
                                if ($.isEmptyObject(val)) {
                                    val = 1;
                                } else {
                                    val = +!parseInt(val[name], 10);
                                }
                                $this.editable('setValue', val);
                                var data = {};
                                data[name] = val;
                                view.model.trigger('change:form', {
                                    op: 'upd',
                                    id: pk,
                                    data: data
                                });
                            });
                    }
                    $this
                        .on('init', function () {
                            if (!isAllowEdit) {
                                _this._markAsNoChanged($this);
                            }
                        })
                        .on('hidden', function () {
                            $(this).focus();
                        }).editable({
                            onblur: 'submit',
                            name: name,
                            title: '',
                            pk: pk,
                            type: 'checklist',
                            mode: 'inline',
                            disabled: true,
                            showbuttons: false,
                            source: [{'value': 1, 'text': ''}],
                            display: function (value) {
                                helpersModule.checkBoxDisplay(value, $(this), customProperties, view);
                            }
                        });
                };
            }
        });
})(jQuery, helpersModule, CardElement);
