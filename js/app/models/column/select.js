var SelectColumnRO = (function (Backbone, helpersModule) {
    'use strict';
    return ColumnRO.extend({
        getJsFn: function () {
            var _this = this;

            return function ($cnt, view) {
                _this.evalReadProc()
                    .done(function (res) {
                        var data = helpersModule.prepareSelectSource(res.data);
                        $cnt.find('.' + _this.getUniqueClass()).each(function () {
                            var $this = $(this),
                                pk = $this.attr('data-pk'),
                                isAllowEdit = _this.isAllowEdit(view, pk);
                            $this
                                .on('init', function selectInit() {
                                    if (!isAllowEdit) {
                                        _this.markAsNoChanged($this);
                                    }
                                })
                                .editable({
                                    disabled: !isAllowEdit,
                                    mode: 'inline',
                                    name: _this.get('key'),
                                    source: data,
                                    showbuttons: false,
                                    onblur: 'submit',
                                    type: 'select'
                                });
                            if (isAllowEdit) {
                                $this
                                    .on('save', function selectSave(e, params) {
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
})(Backbone, helpersModule);