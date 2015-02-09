/**
 * Class DateCardElement
 * @class
 * @augments CardElement
 */
var DateCardElement = (function ($, moment, optionsModule, CardElement) {
    'use strict';
    return CardElement.extend(
        /** @lends DateCardElement */
        {
            _$element: null,
            /**
             * @method destroy
             * @override
             */
            destroy: function () {
                if (this._$element) {
                    this._$element.off('init').off('hidden').off('save').editable('destroy').remove();
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
                    column = _this.getColumn();
                return function () {
                    var $el = $('#' + controlID),
                        name = column.get('key'),
                        view = _this.get('view'),
                        isAllowEdit = column.isAllowEdit(view, pk);
                    _this._persistLinkToEditableElements($el);
                    var options = {
                        onblur: 'submit',
                        name: name,
                        title: column.getVisibleCaption(),
                        mode: 'inline',
                        emptytext: '',
                        disabled: !isAllowEdit,
                        format: 'mm-dd-yyyy hh:ii:ss',
                        showbuttons: false

                    };
                    if (column.getCardEditType() === 'datetime') {
                        options.type = 'datetime';
                        options.viewformat = 'dd.mm.yyyy hh:ii';
                        options.datetimepicker = {
                            language: 'ru',
                            todayBtn: true,
                            weekStart: 1
                        };
                    } else {
                        options.type = 'date';
                        options.viewformat = 'dd.mm.yyyy';
                        options.datetimepicker = {
                            weekStart: 1
                        };
                    }
                    $el
                        .on('init', function dateInit() {
                            var dbData = view.model.getActualDataFromStorage(pk),
                                value = dbData ? dbData[name] : '';
                            if (value && typeof(value) === 'string') {
                                value = moment(value, optionsModule.getSetting('userDateFormat')).toDate();
                            }
                            if (!isAllowEdit) {
                                _this._markAsNoChanged($el);
                            }
                            setTimeout(function () {
                                $el.editable('setValue', value);
                            }, 0);

                        })
                        .on('hidden', function () {
                            $(this).focus();
                        })
                        .editable(options);
                    if (isAllowEdit) {
                        $el
                            .on('save', function dateSave(e, params) {
                                var value = moment(params.newValue)
                                    .format(optionsModule.getSetting('formatDate'));
                                var data = {};
                                data[name] = value;
                                view.model.trigger('change:form', {
                                    op: 'upd',
                                    id: pk,
                                    data: data
                                });
                            });
                    }
                };
            }
        });
})(jQuery, moment, optionsModule, CardElement);