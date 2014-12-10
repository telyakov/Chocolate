var CheckBoxColumnRO = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return ColumnRO.extend({
        getHeaderOptions: function () {
            var options = CheckBoxColumnRO.__super__.getHeaderOptions.apply(this, arguments);
            options['class'] = 'sorter-checkbox';
            return options;
        },
        getJsFn: function ($cnt) {
            var _this = this,
                customProperties = _this.getColumnCustomProperties();
            return function () {
                $cnt.find('[rel$="' + _this.get('key') + '"]')
                    .on('init', function () {
                        chFunctions.checkBoxInitFunc($(this), _this.get('key'), _this.getRawAllowEdit());
                    })
                    .editable({
                        type: 'checklist',
                        mode: 'inline',
                        name: _this.get('key'),
                        source: [{'value': 1, 'text': ''}],
                        showbuttons: false,
                        onblur: 'submit',
                        display: function (value, sourceData) {
                            chCardFunction.checkBoxDisplayFunction(
                                value,
                                $(this),
                                customProperties.get('label'),
                                customProperties.get('color'),
                                customProperties.get('priority')
                            );
                        }
                    })
                ;
            };
        }
    });
})(Backbone, helpersModule, FilterProperties, bindModule);