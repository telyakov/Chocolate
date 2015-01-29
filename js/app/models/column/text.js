/**
 * Class TextColumnRO
 * @class
 * @augments ColumnRO
 */
var TextColumnRO = (function (helpersModule) {
    'use strict';
    return ColumnRO.extend(
        /** @lends TextColumnRO */
        {
            _$editableElements: null,
            /**
             * @method destroy
             * @override
             */
            destroy: function () {
                if (this._$editableElements) {
                    this._$editableElements.off('init').off('save').editable('destroy');
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
                var _this = this,
                    customProperties = _this.getColumnCustomProperties();
                return function ($cnt, view) {
                    var options = {
                            mode: 'inline',
                            name: _this.get('key'),
                            showbuttons: false,
                            disabled: true,
                            onblur: 'submit',
                            savenochange: false
                        },
                        isMarkupSupport = customProperties.get('markupSupport');
                    if (isMarkupSupport) {
                        options.type = 'wysihtml5';
                        options.wysihtml5 = {
                            'font-styles': false,
                            emphasis: false,
                            lists: false,
                            link: false,
                            image: false
                        };
                    } else {
                        options.type = 'text';
                        options.tpl = '<textarea/>';
                    }
                    var $editableElements = $cnt.find('.' + _this._getUniqueClass());
                    _this._persistLinkToEditableElements($editableElements);
                    $editableElements.each(function () {
                        var $this = $(this),
                            pk = $this.attr('data-pk'),
                            isAllowEdit = _this.isAllowEdit(view, pk);

                        if (isMarkupSupport && isAllowEdit) {
                            $this.on('shown', function textShown(e, editable) {
                                helpersModule.textShown(e, editable);
                            });
                        }
                        //todo: fix leak memory - destroy view
                        if (isAllowEdit) {
                            $this
                                .on('save', function (e, params) {
                                    var data = {};
                                    data[_this.get('key')] = params.newValue;
                                    view.model.trigger('change:form', {
                                        op: 'upd',
                                        id: pk,
                                        data: data
                                    });
                                });
                        }
                        $this
                            .on('init', function textInit() {
                                if (!isAllowEdit) {
                                    _this.markAsNoChanged($this);
                                }
                                var $modalBtn = $('<div/>', {
                                    'class': 'grid-modal-open form-modal-button',
                                    'data-name': _this.get('key')
                                });
                                $this.parent().append($modalBtn);

                            })
                            .editable(options);
                    });
                };
            }
        });
})(helpersModule);