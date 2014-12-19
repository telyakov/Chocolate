var TreeColumnRO = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return ColumnRO.extend({
        isSingle: function(){
            return helpersModule.boolEval(this.get('columnProperties').getSingleValueMode(), false);
        },
        getJsFn: function () {
            var _this = this,
                allowEdit = this.getRawAllowEdit();

            return function ($cnt) {
                var defer = _this.evalReadProc();
                defer.done(function (res) {
                    var data = helpersModule.prepareTreeSource(res.data);
                    var $elements = $cnt.find('[rel$="_' + _this.get('key') + '"]');

                    $elements
                        .on('init', function () {
                            chFunctions.treeViewInitFunc(
                                $(this),
                                _this.getVisibleCaption(),
                                _this.getFromKey(),
                                _this.getRawAllowEdit(),
                                _this.isSingle()
                            );
                        })
                        .editable({
                            mode: 'modal',
                            name: _this.get('key'),
                            source: data,
                            showbuttons: false,
                            onblur: 'submit',
                            type: 'text',
                            'data-from-id' : _this.getFromKey()
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