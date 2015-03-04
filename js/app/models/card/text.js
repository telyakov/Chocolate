/**
 * Class TextCardElement
 * @class
 * @augments CardElement
 */
var TextCardElement = (function ($, _, helpersModule, undefined, optionsModule, CardElement, wysihtml5) {
    'use strict';
    return CardElement.extend(
        /** @lends TextCardElement */
        {
//todo: leak memory
            _$element: null,
            /**
             * @method destroy
             * @override
             */
            destroy: function () {
                if (this._$element) {
                    this._$element.off('save').off('hidden').off('init').editable('destroy').remove();
                    this._$element = null;
                }
                this.constructor.__super__.destroy.apply(this, arguments);
            },
            /**
             * @override
             */
            showError: function () {
                if (this._$element) {
                    this._$element
                        .closest('.card-col')
                        .children('label')
                        .addClass('card-error');
                }
            },
            /**
             * @param $element {jQuery|null}
             * @private
             * @description for the destruction of unused objects and events
             */
            _persistLinkToEditableElements: function ($element) {
                this._$element = $element;
            },
            controlTemplate: _.template(
                [
                    '<div class="table-td">',
                    '<a tabindex="<%=tabindex %>" class="<%= cls %>" id="<%=id %>" rel="<%=key+\'_\' +pk %>" data-pk="<%=pk %>"',
                    '></a>',
                    '</div>'
                ].join('')
            ),
            /**
             * @override
             * @protected
             * @returns {String}
             */
            _renderControl: function (pk, controlID, tabindex) {
                return this.controlTemplate({
                    tabindex: tabindex,
                    id: controlID,
                    key: this.get('column').get('key'),
                    pk: pk,
                    cls: this.get('column').getColumnCustomProperties().get('markupSupport') ? 'ch-card-iframe' : ''
                });
            },
            /**
             * @override
             * @param controlID {String}
             * @param pk {String}
             * @returns {Function}
             * @protected
             */
            _getCallback: function (controlID, pk) {
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
                            //mode: 'inline',
                            //showbuttons: false,
                            emptytext: '',
                            onblur: 'submit',
                            inputclass: 'chocolate-textarea',
                            validate: function (value) {
                                _this.validate($(this), value);
                            }
                        };
                    if(!isAllowEdit){
                        if (!isMarkupSupport) {
                            options.disabled = true;
                        } else {
                            options.tpl = '<textarea disabled></textarea>'
                        }
                    }
                    _this._persistLinkToEditableElements($el);
                    if (isMarkupSupport) {
                        options.type = 'wysihtml5';
                        options.showbuttons = true;
                        options.mode = 'modal';
                        options.wysihtml5 = {
                            'font-styles': true,
                            emphasis: true,
                            lists: true,
                            html: false,
                            link: false,
                            image: false,
                            color: false
                        };
                        if(isAllowEdit){
                            options.wysihtml5.toolbar = {
                                assSigh: helpersModule.generateHtmlIframeAddSignButton()
                            };
                        }
                    } else {
                        options.mode = 'inline';
                        options.showbuttons = false;
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
                    if (!isMarkupSupport) {
                        //todo: cache
                        $parent.on('click', '.grid-modal-open', function () {
                            helpersModule.leaveFocus();
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
                                        console.log('save')
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
                                    })
                                    .on('shown', function (e, editable) {
                                        if (editable) {
                                            var $toolbar = $('<div></div>', {
                                                'class': 'ch-toolbar',
                                                html: helpersModule.generateHtmlIframeAddSignButton()
                                            });
                                            editable.$form.find('.editable-input').prepend($toolbar)
                                        }
                                    });
                            }

                            $textModal.on('hidden', function () {
                                $el.focus();
                            })

                            if ($textModal.attr('data-init') === undefined) {
                                $textModal.editable({
                                    type: 'textarea',
                                    mode: 'popup',
                                    onblur: 'ignore',
                                    savenochange: false,
                                    title: column.getModalTitle(pk),
                                    tpl: helpersModule.generateTemplateTextArea(isAllowEdit)
                                });
                                $textModal.attr('data-init', 1);
                            }
                            $textModal.editable('setValue', actualValue);
                            $textModal.editable('show');
                            return false;
                        });
                    }
                    $el
                        .on('init', function () {
                            var dbData = view.model.getActualDataFromStorage(pk),
                                value = dbData ? dbData[name] : '';
                            if (isNeedFormat && value) {
                                value = helpersModule.formatNumber(value);
                            }
                            if (!isAllowEdit) {
                                _this._markAsNoChanged($el);
                            }
                            if (value === null) {
                                value = '';
                            }
                            setTimeout(function () {
                                $el.editable('setValue', value);
                                if (!isMarkupSupport) {
                                    $parent.append('<div class="grid-modal-open"></div>');
                                }
                            }, 0);
                        })
                        .editable(options);
                };
            },
            /**
             * @override
             * @protected
             * @returns {Boolean}
             */
            _isStatic: function () {
                return this.getHeight() === 1;
            }
        });
})(jQuery, _, helpersModule, undefined, optionsModule, CardElement, wysihtml5);