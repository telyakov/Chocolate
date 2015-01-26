/**
 * Class TreeColumnRO
 * @class
 * @augments ColumnRO
 */
var TreeColumnRO = (function (helpersModule, undefined) {
    'use strict';
    return ColumnRO.extend(
        /** @lends TreeColumnRO */
        {
            /**
             * @override
             * @returns {Function}
             */
            getJsFn: function () {
                var _this = this;
                return function ($cnt, viewProperty) {
                    _this.receiveData()
                        .done(function (res) {
                            var data = helpersModule.prepareTreeSource(res.data),
                                selector = '.' + _this._getUniqueClass();
                            $cnt.on('click', selector, function () {
                                var $this = $(this),
                                    pk = $this.attr('data-pk'),
                                    isAllowEdit = _this.isAllowEdit(viewProperty, pk);
                                if (isAllowEdit) {
                                    var model = new DynatreeModel({
                                            $el: $this
                                        }),
                                        view = new FormDynatreeView({
                                            model: model,
                                            dataModel: viewProperty.model
                                        });
                                    view.render(_this.isSingle(), _this.getModalTitle(pk), pk, _this.get('key'));
                                }
                            });
                            $cnt.find(selector).each(function () {
                                var $this = $(this),
                                    pk = $this.attr('data-pk'),
                                    isAllowEdit = _this.isAllowEdit(viewProperty, pk);
                                $this
                                    .on('init', function treeInit() {
                                        var dataKey = _this.getFromKey(),
                                            dbData = viewProperty.getDBDataFromStorage(pk);
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
                            });
                        });
                };
            }

        });
})(helpersModule, undefined);