var CheckBoxCardElement = (function ($, helpersModule) {
    'use strict';
    return CardElement.extend({
        getCallback: function (controlID, pk) {
            var _this = this,
                column = _this.get('column'),
                customProperties = column.getColumnCustomProperties();
            return function () {
                var name = column.get('key'),
                    view = _this.get('view'),
                    isAllowEdit = column.isAllowEdit(view, pk),
                    $this = $('#' + controlID);
                if(isAllowEdit){
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
                            _this.markAsNoChanged($this);
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
})(jQuery, helpersModule);