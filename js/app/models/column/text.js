var TextColumnRO = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return ColumnRO.extend({
        getJsFn: function () {
            var _this = this,
                customProperties = _this.getColumnCustomProperties();
            return function ($cnt) {
                var $elements = $cnt.find('.' + _this.getUniqueClass());
                var options = {
                    mode: 'inline',
                    name: _this.get('key'),
                    showbuttons: false,
                    onblur: 'submit',
                    savenochange: false
                };
                var isMarkupSupport = customProperties.get('markupSupport'),
                    rawAllowEdit = _this.getRawAllowEdit();
                if (isMarkupSupport) {
                    if (rawAllowEdit) {
                        $elements.on('shown', function (e, editable) {
                            chFunctions.textShownFunction(e, editable);
                        });
                    }
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
                if (rawAllowEdit) {
                    $elements
                        .on('save', function (e, params) {
                            chFunctions.defaultColumnSaveFunc(e, params, _this.get('key'));
                        });
                }
                $elements
                    .on('init', function (e, editable) {
                        var $element = editable.$element,
                            column = facade.getFactoryModule().makeChGridColumnBody($element),
                            isEdit = chCardFunction._isAllowEdit(column.getDataObj(), rawAllowEdit);
                        if (!isEdit) {
                            $(this).unbind('click');
                            column.markAsNoChanged();
                        }
                        var $modalBtn = $('<div/>', {
                            'class' : 'grid-modal-open form-modal-button',
                            'data-name': _this.get('key')
                        });
                        $element.parent().append($modalBtn);

                    })
                    .editable(options);
            };
        }
    });
})(Backbone, helpersModule, FilterProperties, bindModule);