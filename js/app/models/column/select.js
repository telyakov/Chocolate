/**
 * Class SelectColumnRO
 * @class
 * @augments ColumnRO
 */
var SelectColumnRO = (function (Backbone, helpersModule) {
    'use strict';
    return ColumnRO.extend(
        /** @lends SelectColumnRO */
        {
            _$editableElements: null,
            /**
             * @method destroy
             * @override
             */
            destroy: function () {
                if (this._$editableElements) {
                    this._$editableElements.off('init').off('save').editable('destroy').remove();
                    this._$editableElements = null;
                }
                this.constructor.__super__.destroy.apply(this, arguments);
            },
            /**
             * @param $editableElements {jQuery|null}
             * @private
             * @description for the destruction of unused objects and events
             */
            _persistLinkToEditableElements: function ($editableElements) {
                this._$editableElements = $editableElements;
            },
            /**
             * @override
             * @returns {Function}
             */
            getJsFn: function () {
                var _this = this;

                return function ($cnt, view, defer) {
                    //todo: fix leak memory - destroy view

                    _this.startAsyncTaskGetData()
                        .done(function (res) {
                            var data = helpersModule.prepareSelectSource(res.data);
                            var $editableElements = $cnt.find('.' + _this._getUniqueClass());
                            _this._persistLinkToEditableElements($editableElements);
                            $editableElements.each(function () {
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
                            defer.resolve();
                        });
                };
            }
        });
})(Backbone, helpersModule);