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
            _$cnt: null,
            _$editableElements: null,
            /**
             * @method destroy
             * @override
             */
            destroy: function(){
                if(this._$cnt){
                    this._$cnt.off('click');
                    delete this._$cnt;
                }
                if(this._$editableElements){
                    this._$editableElements.off('init').editable('destroy').remove();
                }
                this.constructor.__super__.destroy.apply(this, arguments);
            },
            /**
             * @param $cnt {jQuery|null}
             * @private
             * @description for the destruction of unused objects and events
             */
            _persistLinkToContext: function($cnt){
                this._$cnt = $cnt;
            },
            /**
             * @param $editableElements {jQuery|null}
             * @private
             * @description for the destruction of unused objects and events
             */
            _persistLinkToEditableElements: function($editableElements){
                this._$editableElements = $editableElements;
            },
            /**
             * @override
             * @returns {Function}
             */
            getJsFn: function () {
                var _this = this;
                return function ($cnt, viewProperty) {
                    _this.receiveData()
                        .done(function (res) {
                            _this._persistLinkToContext($cnt);
                            var data = helpersModule.prepareTreeSource(res.data),
                                selector = '.' + _this._getUniqueClass();
                            $cnt.on('click', selector, function () {
                                var $this = $(this),
                                    pk = $this.attr('data-pk'),
                                    isAllowEdit = _this.isAllowEdit(viewProperty, pk);
                                if (isAllowEdit) {
                                    //todo: fix leak memory && destroy viewProperty
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
                            var $editableElements = $cnt.find(selector);
                            _this._persistLinkToEditableElements($editableElements);
                            $editableElements.each(function () {
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