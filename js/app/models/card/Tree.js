var TreeCardElement = (function ($, helpersModule, undefined) {
    'use strict';
    return CardElement.extend({
        getCallback: function (controlID, pk) {
            var _this = this,
                column = _this.get('column');
            return function () {
                //todo: поддержка выбора дочерней сетки
                column.evalReadProc()
                    .done(function (res) {
                        var data = helpersModule.prepareTreeSource(res.data),
                            $el = $('#' + controlID),
                            name = column.get('key'),
                            view = _this.get('view'),
                            isAllowEdit = column.isAllowEdit(view, pk);
                        if (isAllowEdit) {
                            $el.on('click', function () {
                                var dynatreeElem = new ChDynatree($el),
                                    options = helpersModule.treeViewOptions($el, column.isSingle());
                                options.okButton = function okButton($tree, $input) {
                                    var chDynatree = this;
                                    return {
                                        'text': 'Сохранить',
                                        'class': 'wizard-active wizard-next-button',
                                        click: function () {
                                            var selectedNodes = $tree.dynatree('getSelectedNodes'),
                                                val = '',
                                                selectedHtml = '',
                                                isSelectAll = chDynatree.isSelectAll(),
                                                i,
                                                hasOwn = Object.prototype.hasOwnProperty;
                                            for (i in selectedNodes) {
                                                if (hasOwn.call(selectedNodes, i)) {
                                                    var node = selectedNodes[i];
                                                    if (isSelectAll || node.childList === null) {
                                                        val += node.data.key;
                                                        if (!chDynatree.isSingleMode()) {
                                                            val += chDynatree.getSeparator();
                                                        }
                                                        if (i > 0) {
                                                            selectedHtml += '/';
                                                        }
                                                        selectedHtml += node.data.title;
                                                    }
                                                }
                                            }
                                            $input.editable('setValue', val);
                                            var data = {};
                                            data[name] = val;
                                            view.model.trigger('change:form', {
                                                op: 'upd',
                                                id: pk,
                                                data: data
                                            });
                                            $input.html(selectedHtml);
                                            $(this).dialog('close');
                                        }
                                    };
                                };
                                options.defaultValues = function () {
                                    return this.data().editable.value;
                                };
                                dynatreeElem.buildFromData(options);
                            });
                        }
                        $el.on('init', function () {
                            var dbData = view.getActualDataFromStorage(pk),
                                value = dbData ? dbData[name] : '';
                            var text = dbData ? dbData[column.getFromKey()] : '';
                            if (value === undefined || value === null) {
                                value = '';
                            }
                            setTimeout(function () {
                                $el.editable('setValue', value);
                                $el.text(text);
                            }, 0);
                        })
                            .editable({
                                name: name,
                                title: '',
                                pk: pk,
                                disabled: true,
                                type: 'text',
                                mode: 'modal',
                                source: data,
                                showbuttons: false,
                                validate: function (value) {
                                    _this.validate($(this), value);
                                }
                            });
                    });
            };
        }
    });
})(jQuery, helpersModule, undefined);