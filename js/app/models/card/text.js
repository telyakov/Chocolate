var TextCardElement = (function ($, _, helpersModule, undefined, optionsModule) {
    'use strict';
    return CardElement.extend({
        controlTemplate: _.template(
            [
                '<div class="table-td">',
                '<a tabindex="<%=tabindex %>" class="<%= cls %>" id="<%=id %>" rel="<%=key+\'_\' +pk %>" data-pk="<%=pk %>"',
                '></a>',
                '</div>'
            ].join('')
        ),
        renderControl: function (pk, controlID, tabindex) {
            return this.controlTemplate({
                tabindex: tabindex,
                id: controlID,
                key: this.get('column').get('key'),
                pk: pk,
                cls: this.get('column').getColumnCustomProperties().get('markupSupport') ? 'ch-card-iframe' : ''
            });
        },
        getCallback: function (controlID, pk) {
            var _this = this,
                column = _this.get('column'),
                customProperties = column.getColumnCustomProperties();
            return function () {
                var $el = $('#' + controlID),
                    name = column.get('key'),
                    isMarkupSupport = customProperties.get('markupSupport'),
                    caption = column.getVisibleCaption(),
                    view = _this.get('view'),
                    isAllowEdit = column.isAllowEdit(view, pk),
                    options = {
                        name: name,
                        pk: pk,
                        title: caption,
                        mode: 'inline',
                        showbuttons: false,
                        emptytext: '',
                        disabled: !isAllowEdit,
                        onblur: 'submit',
                        inputclass: 'chocolate-textarea',
                        validate: function (value) {
                            chCardFunction.defaultValidateFunc($(this), value);
                        }
                    };
                if (isMarkupSupport) {
                    $el
                        .on('shown', function (e, editable) {
                            chFunctions.textShownFunction(e, editable);
                        });
                    options.type = 'wysihtml5';
                    options.wysihtml5 = {
                        'font-styles': false,
                        emphasis: false,
                        list: false,
                        link: false,
                        image: false
                    };
                } else {
                    options.type = 'text';
                    options.tpl = '<textarea/>';
                }

                if (isAllowEdit) {
                    $el
                        .on('save', function (e, params) {
                            var data = {};
                            data[name] = params.newValue;
                            view.model.trigger('change:form', {
                                op: 'upd',
                                id: pk,
                                data: data
                            });
                        });
                }
                //todo: format support
                var $parent = $el.parent(),
                    isNeedFormat = false;
                $parent.on('click', '.grid-modal-open', function () {
                    var $textModal = $('<a/>', {
                        'class': 'grid-textarea'
                    }),
                     actualValue = $el.editable('getValue')[name];
                    if (actualValue === undefined) {
                        actualValue = '';
                    }
                    if (isNeedFormat) {
                        actualValue = helpersModule.formatNumber(actualValue);
                    }
                    if (actualValue) {
                        actualValue = actualValue.toString();
                    }
                    $textModal.appendTo($parent.closest('.card-content'));
                    helpersModule.leaveFocus();
                    if (isAllowEdit) {
                        $textModal
                            .on('save', function (e, params) {
                                if (params.newValue !== undefined) {
                                    var data = {};
                                    data[name] = params.newValue;
                                    view.model.trigger('change:form', {
                                        op: 'upd',
                                        id: pk,
                                        data: data
                                    });
                                    $el.editable("setValue", params.newValue);
                                    $textModal.empty();
                                }
                            });
                    }

                    $textModal.on('hidden', function () {
                        $el.focus();
                    });
                    if (isMarkupSupport) {
                        if ($textModal.attr('data-init') === undefined) {
                            chFunctions.wysiHtmlInit($textModal, column.getModalTitle(pk));
                            $textModal.attr('data-init', 1);
                        }
                        if (actualValue) {
                            actualValue = helpersModule.newLineSymbolsToBr(actualValue);
                        }
                        $textModal.editable('setValue', actualValue);
                        $textModal.editable('show');
                        var $textArea = $textModal.next('div').find('textarea');
                        if (!isAllowEdit) {
                            $textArea.attr('readonly', 'true');
                        } else {
                            var editor = new wysihtml5.Editor($textArea.get(0));
                            editor.on("load", function (e) {
                                var $tbody = $textArea.siblings('iframe').eq(1).contents().find('body');
                                $tbody
                                    .on('keydown', helpersModule.addSignToIframe)
                                    .on('keydown', function (e) {
                                        if (e.keyCode === optionsModule.getKeyCode('escape')) {
                                            $textModal.editable('hide');
                                        }
                                    });
                            });
                        }
                    } else {
                        if ($textModal.attr('data-init') === undefined) {
                            $textModal.editable({
                                type: 'textarea',
                                mode: 'popup',
                                onblur: 'ignore',
                                savenochange: false,
                                title:  column.getModalTitle(pk)
                            });
                            $textModal.attr('data-init', 1);
                        }
                        $textModal.editable('setValue', actualValue);
                        $textModal.editable('show');
                        if (!isAllowEdit) {
                            $textModal.next('div').find('textarea').attr('readonly', 'true');
                        }
                    }
                    return false;
                });
                $el
                    .on('init', function () {
                        var value = view.getActualDataFromStorage(pk)[name];
                        if (isNeedFormat && value) {
                            value = helpersModule.formatNumber(value);
                        }
                        if (!isAllowEdit) {
                            _this.markAsNoChanged($el);
                        }
                        if (value === null) {
                            value = '';
                        }
                        setTimeout(function () {
                            $el.editable('setValue', value);
                            $parent.append('<div class="grid-modal-open"></div>');
                        }, 0);
                    })
                    .on('shown', function (e, editable) {
                        chFunctions.textShownFunction(e, editable);
                    })
                    .editable(options);
            };
        },
        isStatic: function () {
            return this.getHeight() === 1;
        }
    });
})(jQuery, _, helpersModule, undefined, optionsModule);