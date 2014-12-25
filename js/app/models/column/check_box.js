var CheckBoxColumnRO = (function (helpersModule) {
    'use strict';
    return ColumnRO.extend({
        getHeaderOptions: function () {
            var options = CheckBoxColumnRO.__super__.getHeaderOptions.apply(this, arguments);
            options['class'] = 'sorter-checkbox';
            return options;
        },
        getJsFn: function () {
            var _this = this,
                customProperties = _this.getColumnCustomProperties();
            return function ($cnt, view) {
                var selector = '.' + _this.getUniqueClass();
                $cnt.on('click', selector, function checkBoxClick() {
                    var $this = $(this),
                        pk = $this.attr('data-pk');
                    if (_this.isAllowEdit(view, pk)) {
                        var attribute = _this.get('key'),
                            column = facade.getFactoryModule().makeChGridColumnBody($this),
                            val = $this.editable('getValue');
                        if ($.isEmptyObject(val)) {
                            val = 1;
                        } else {
                            val = +!val[attribute];
                        }
                        $this.editable('setValue', val);
                        var data = {};
                        data[attribute] = val;
                        view.model.trigger('change:form', {
                            op: 'upd',
                            id: pk,
                            data: data
                        });
                    }
                });
                $cnt.find(selector)
                    .on('init', function checkBoxInit() {
                        var $this = $(this),
                            pk = $this.attr('data-pk');
                        if (!_this.isAllowEdit(view, pk)) {
                            _this.markAsNoChanged($this);
                        }
                    })
                    .editable({
                        type: 'checklist',
                        disabled: true,
                        mode: 'inline',
                        name: _this.get('key'),
                        source: [{'value': 1, 'text': ''}],
                        showbuttons: false,
                        onblur: 'submit',
                        display: function (value) {
                            helpersModule.checkBoxDisplay(
                                value,
                                $(this),
                                customProperties,
                                view
                            );
                        }
                    });
            };
        }
    });
})(helpersModule);