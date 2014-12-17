var CheckBoxCardElement = (function () {
    'use strict';
    return CardElement.extend({
        getCallback: function (controlID, pk) {
            var _this = this,
                column = _this.get('column'),
                customProperties = column.getColumnCustomProperties();
            return function () {
                var $el = $('#' + controlID);
                var name = column.get('key'),
                    rawEdit = column.getRawAllowEdit();
                $el
                    .on('init', function () {
                        chCardFunction.checkBoxInitFunction($(this), name, rawEdit);
                    })
                    .on('hidden', function () {
                        $(this).focus();
                    }).editable({
                        'onblur': 'submit',
                        'name': name,
                        'title': '',
                        pk: pk,
                        'type': 'checklist',
                        'mode': 'inline',
                        'showbuttons': false,
                        'source': [{'value': 1, 'text': ''}],
                        'display': function (value, sourceData) {
                            chCardFunction.checkBoxDisplayFunction(value, $(this), customProperties.get('label'), customProperties.get('color'), customProperties.get('priority'));
                        }
                    });
            };
        }
    });
})();