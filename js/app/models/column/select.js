var SelectColumnRO = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return ColumnRO.extend({
        getJsFn: function () {
            var _this = this,
                allowEdit = this.getRawAllowEdit();

            return function ($cnt) {
                var defer =_this.evalReadProc();
                defer.done(function (res) {
                    var data = helpersModule.prepareSelectSource(res.data);
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