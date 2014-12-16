var DateCardElement = (function () {
    'use strict';
    return CardElement.extend({
        getCallback: function (controlID, pk) {
            var _this = this,
                column = _this.get('column');
            return function () {
                var $el = $('#' + controlID);
                var name = column.get('key'),
                    rawEdit = column.getRawAllowEdit(),
                    caption = column.getVisibleCaption();
                var options = {
                    'onblur': 'submit',
                    'name': name,
                    'title': caption,
                    'mode': 'inline',
                    'emptytext': '',
                    'format': 'mm-dd-yyyy hh:ii:ss',
                    'showbuttons': false

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
                    .on('init', function () {
                        chCardFunction.dateInitFunction($(this), name, rawEdit);
                    })
                    .on('save', function (e, params) {
                        chCardFunction.dateSaveFunc(e, params, name);
                    })
                    .on('hidden', function () {
                        $(this).focus();
                    }).editable(options);
            };
        }
    });
})();