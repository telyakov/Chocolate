/**
 * Class DateColumnRO
 * @class
 * @augments ColumnRO
 */
var DateColumnRO = (function (optionsModule) {
    'use strict';
    return ColumnRO.extend(
        /** @lends DateColumnRO */
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
             * @returns {Object}
             */
            getHeaderOptions: function () {
                var options = DateColumnRO.__super__.getHeaderOptions.apply(this, arguments);
                options['class'] = 'sorter-shortDate';
                return options;
            },
            /**
             * @override
             * @returns {Function}
             */
            getJsFn: function () {
                var _this = this,
                    isTime = _this.getEditType() === 'date';

                return function ($cnt, view, defer) {
                    //todo: fix leak memory - destroy view
                    var selector = '.' + _this._getUniqueClass();
                    var $editableElements = $cnt.find(selector);
                    _this._persistLinkToEditableElements($editableElements);
                    $editableElements.each(function () {
                        var $elem = $(this),
                            pk = $elem.attr('data-pk'),
                            isAllowEdit = _this.isAllowEdit(view, pk);
                        $elem
                            .on('init', function dateInit() {
                                if (!isAllowEdit) {
                                    _this.markAsNoChanged($elem);
                                }
                            })
                            .editable({
                                mode: 'inline',
                                disabled: !isAllowEdit,
                                name: _this.get('key'),
                                showbuttons: false,
                                onblur: 'submit',
                                type: isTime ? 'date' : 'datetime',
                                inputclass: isTime ? 'input-medium' : '',
                                datetimepicker: {
                                    language: 'ru',
                                    todayBtn: 'true',
                                    weekStart: '1'
                                },
                                format: 'mm-dd-yyyy hh:ii:ss',
                                viewformat: 'dd.mm.yyyy hh:ii'
                            });
                        if (isAllowEdit) {
                            $elem
                                .on('save', function dateSave(e, params) {
                                    var value = params.newValue;
                                    if (value) {
                                        value = moment(value)
                                            .format(optionsModule.getSetting('formatDate'));
                                    }
                                    var data = {};
                                    data[_this.get('key')] = value;
                                    view.model.trigger('change:form', {
                                        op: 'upd',
                                        id: pk,
                                        data: data
                                    });
                                });
                        }
                    });
                    defer.resolve();
                };
            }
        });
})(optionsModule);