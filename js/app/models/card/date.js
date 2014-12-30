var DateCardElement = (function ($, moment, optionsModule, CardElement) {
    'use strict';
    return CardElement.extend({
        getCallback: function (controlID, pk) {
            var _this = this,
                column = _this.get('column');
            return function () {
                var $el = $('#' + controlID),
                    name = column.get('key'),
                    view = _this.get('view'),
                    isAllowEdit = column.isAllowEdit(view, pk);
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
                        var dbData = view.getActualDataFromStorage(pk),
                            value = dbData ? dbData[name] : '';
                        if (value && typeof(value) === 'string') {
                            value = moment(value, 'MM.DD.YYYY HH:mm:ss').toDate();
                        }
                        if (!isAllowEdit) {
                            _this.markAsNoChanged($el);
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