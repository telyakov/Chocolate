var DateColumnRO = (function (Backbone, helpersModule, FilterProperties, bindModule) {
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

            return function ($cnt) {
                $cnt.find('.' + _this.getUniqueClass())
                    .on('init', function () {
                        chFunctions.dateColumnInitFunction($(this), allowEdit);
                    })
                    .on('save', function (e, params) {
                        chFunctions.dateColumnSaveFunction(e, params, _this.get('key'));
                    })
                    .editable({
                        mode: 'inline',
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
                    })
                ;
            };
        }

    });
})(Backbone, helpersModule, FilterProperties, bindModule);