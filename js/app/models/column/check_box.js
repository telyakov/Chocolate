/**
 * Class CheckBoxColumnRO
 * @class
 * @augments ColumnRO
 */
var CheckBoxColumnRO = (function (helpersModule) {
    'use strict';
    return ColumnRO.extend(
        /** @lends CheckBoxColumnRO */
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
             * @returns {Object}
             */
            getHeaderOptions: function () {
                var options = CheckBoxColumnRO.__super__.getHeaderOptions.apply(this, arguments);
                options['class'] = 'sorter-checkbox';
                return options;
            },
            /**
             * @override
             * @returns {Function}
             */
            getJsFn: function () {
                var _this = this,
                    customProperties = _this.getColumnCustomProperties();
                return function ($cnt, view, defer) {
                    _this._persistLinkToContext($cnt);
                    var selector = '.' + _this._getUniqueClass();
                    $cnt.on('click', selector, function checkBoxClick() {
                        var $this = $(this),
                            pk = $this.attr('data-pk');
                        if (_this.isAllowEdit(view, pk)) {
                            var attribute = _this.get('key'),
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
                    var $editableElements = $cnt.find(selector);
                    _this._persistLinkToEditableElements($editableElements);
                    $editableElements
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
                    defer.resolve();
                };
            }
        }
    )
        ;
})(helpersModule);