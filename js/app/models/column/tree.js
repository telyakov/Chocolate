var TreeColumnRO = (function (helpersModule, undefined) {
    'use strict';
    return ColumnRO.extend({
        isSingle: function () {
            return helpersModule.boolEval(this.get('columnProperties').getSingleValueMode(), false);
        },
        getJsFn: function () {
            var _this = this;
            return function ($cnt, view) {
                _this.evalReadProc()
                    .done(function (res) {
                        var data = helpersModule.prepareTreeSource(res.data),
                            selector = '.' + _this.getUniqueClass();
                        $cnt.on('click', selector, function () {
                            var $this = $(this),
                                pk = $this.attr('data-pk'),
                                isAllowEdit = _this.isAllowEdit(view, pk);
                            if (isAllowEdit) {
                                var isSingle = _this.isSingle(),
                                    dynatreeElem = new ChDynatree($this),
                                    options = chFunctions.treeViewOptions($this, isSingle);
                                options.title = _this.getModalTitle(pk);
                                dynatreeElem.buildFromData(options);
                            }
                        });
                        $cnt.find(selector).each(function () {
                            var $this = $(this),
                                pk = $this.attr('data-pk'),
                                isAllowEdit = _this.isAllowEdit(view, pk);
                            $this
                                .on('init', function treeInit() {
                                    var dataKey = _this.getFromKey(),
                                        dbData = view.getDBDataFromStorage(pk);
                                    if (dbData !== undefined) {
                                        $this.html(dbData[dataKey]);
                                    }
                                    if (!isAllowEdit) {
                                        _this.markAsNoChanged($this);
                                    }
                                })
                                .editable({
                                    mode: 'modal',
                                    name: _this.get('key'),
                                    source: data,
                                    disabled: true,
                                    showbuttons: false,
                                    onblur: 'submit',
                                    type: 'text',
                                    'data-from-id': _this.getFromKey()
                                });
                            if (isAllowEdit) {
                                $this
                                    .on('save', function treeSave(e, params) {
                                        var data = {};
                                        data[_this.get('key')] = params.newValue;
                                        view.model.trigger('change:form', {
                                            op: 'upd',
                                            id: pk,
                                            data: data
                                        });
                                    });
                            }
                        });
                    });
            };
        }

    });
})(helpersModule, undefined);