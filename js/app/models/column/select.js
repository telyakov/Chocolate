var SelectColumnRO = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return ColumnRO.extend({
        getJsFn: function ($cnt) {
            var _this = this,
                allowEdit = this.getRawAllowEdit();

            return function () {
                var defer = deferredModule.create(),
                    deferId = deferredModule.save(defer);
                _this.evalReadProc(deferId);
                defer.done(function (res) {
                    var rawData = res.data;
                    var data = [],
                        iterator;
                    for (iterator in rawData) {
                        if (rawData.hasOwnProperty(iterator)) {
                            data.push({
                                text: rawData[iterator].name,
                                value: rawData[iterator].id
                            });
                        }
                    }
                    var $elements = $cnt.find('[rel$="_' + _this.get('key') + '"]');
                    $elements
                        .on('init', function () {
                            chFunctions.selectColumnInitFunc($(this), allowEdit);
                        })
                        .editable({
                            mode: 'inline',
                            name: _this.get('key'),
                            source: data,
                            showbuttons: false,
                            onblur: 'submit',
                            type: 'select'
                        });
                    if (allowEdit) {
                        $elements
                            .on('save', function (e, params) {
                                chFunctions.defaultColumnSaveFunc(e, params, _this.get('key'));
                            });
                    }
                });
            };
        }
    });
})(Backbone, helpersModule, FilterProperties, bindModule);