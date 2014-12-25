var DateColumnRO = (function (optionsModule) {
    'use strict';
    return ColumnRO.extend({
        getHeaderOptions: function () {
            var options = DateColumnRO.__super__.getHeaderOptions.apply(this, arguments);
            options['class'] = 'sorter-shortDate';
            return options;
        },
        getJsFn: function () {
            var _this = this,
                isTime = _this.getEditType() === 'date',
                allowEdit = this.getRawAllowEdit();

            return function ($cnt, view) {
                var selector = '.' + _this.getUniqueClass();
                $cnt.find(selector).each(function () {
                    var $elem = $(this),
                        pk = $elem.attr('data-pk'),
                        isAllowEdit = _this.isAllowEdit(view, pk);
                    $elem
                        .on('init', function dateInit() {
                            if (!isAllowEdit) {
                                _this.markAsNoChanged($elem);
                            }
                        })
                        .editable({
                            mode: 'inline',
                            disabled: !isAllowEdit,
                            name: _this.get('key'),
                            showbuttons: false,
                            onblur: 'submit',
                            type: isTime ? 'date' : 'datetime',
                            inputclass: isTime ? 'input-medium' : '',
                            datetimepicker: {
                                language: 'ru',
                                todayBtn: 'true',
                                weekStart: '1'
                            },
                            format: 'mm-dd-yyyy hh:ii:ss',
                            viewformat: 'dd.mm.yyyy hh:ii'
                        });
                    if (isAllowEdit) {
                        $elem
                            .on('save', function dateSave(e, params) {
                                var value = params.newValue;
                                if (value) {
                                    value = moment(value)
                                        .format(optionsModule.getSetting('formatDate'));
                                }
                                var data = {};
                                data[_this.get('key')] = value;
                                view.model.trigger('change:form', {
                                    op: 'upd',
                                    id: pk,
                                    data: data
                                });
                            });
                    }
                });
            };
        }
    });
})(optionsModule);