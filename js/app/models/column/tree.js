var TreeColumnRO = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return ColumnRO.extend({
        isSingle: function(){
            return helpersModule.boolEval(this.get('columnProperties').getSingleValueMode(), false);
        },
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
                                id: rawData[iterator].id,
                                description:  rawData[iterator].description ?
                                    rawData[iterator].description:
                                    ''
                            });
                        }
                    }
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