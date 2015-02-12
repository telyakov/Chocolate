/**
 * Class TextColumnRO
 * @class
 * @augments ColumnRO
 */
var TextColumnRO = (function (undefined, helpersModule, optionsModule) {
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
                    this._$editableElements.off('init').off('save').editable('destroy').remove();
                    this._$editableElements = null;
                }
                var buttons = this._modalButtons;
                if (buttons.length) {
                    buttons.forEach(function ($button, index) {
                        $button.off('click');
                        delete buttons[index];
                    });
                }
                delete this._modalButtons
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
            _modalButtons: [],
            /**
             * @param {?jQuery} $element
             * @private
             * @description for the destruction of unused objects and events
             */
            _persistReferenceToModalButton: function ($element) {
                this._modalButtons.push($element);
            },
            /**
             * @override
             * @returns {Function}
             */
            getJsFn: function () {
                var _this = this,
                    customProperties = _this.getColumnCustomProperties();
                return function ($cnt, view, defer) {
                    var options = {
                            mode: 'inline',
                            name: _this.get('key'),
                            showbuttons: false,
                            disabled: false,
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
                        }else{
                            options.disabled = true;
                        }
                        $this
                            .on('init', function textInit() {
                                if (!isAllowEdit) {
                                    _this.markAsNoChanged($this);
                                }
                                var $button = $('<div/>', {
                                    'class': 'grid-modal-open form-modal-button',
                                    'data-name': _this.get('key')
                                });
                                _this._persistReferenceToModalButton($button);
                                $button.on('click', function (e) {
                                        _this._openTextColumnInModalView(e, pk, view);
                                    }
                                );
                                $this.parent().append($button);

                            })
                            .editable(options);
                    });
                    defer.resolve();
                };
            },
            /**
             *
             * @param {Event} e
             * @param {string} id
             * @param {FormView} view
             * @returns {boolean}
             * @private
             */
            _openTextColumnInModalView: function (e, id, view) {
                var $this = $(e.target);
                var editor;
                var $body;
                /**
                 *
                 * @type {FormModel}
                 */
                var model = view.model;
                var key = this.get('key'),
                    $elem = $this.prevAll('a'),
                    isAllowEdit = this.isAllowEdit(view, id),
                    caption = this.getVisibleCaption(),
                    isMarkupSupport = !!this.getColumnCustomProperties().get('markupSupport'),
                    $cell = $elem.parent(),
                    $popupControl = $('<a/>', {
                        'class': 'grid-textarea'
                    });
                helpersModule.leaveFocus();
                $popupControl.appendTo($cell.closest('section'));
                if (isMarkupSupport) {
                    helpersModule.wysiHtmlInit($popupControl, helpersModule.createTitleHtml(id, caption));
                } else {
                    $popupControl.editable({
                        type: 'textarea',
                        mode: 'popup',
                        onblur: 'ignore',
                        savenochange: false,
                        title: helpersModule.createTitleHtml(id, caption)
                    });
                }
                if (isAllowEdit) {
                    $popupControl
                        .on('save', function saveHandler(e, params) {
                            if (params.newValue !== undefined) {
                                var data = {};
                                data[key] = params.newValue;
                                model.trigger('change:form', {
                                    op: 'upd',
                                    id: id,
                                    data: data
                                });
                                $elem.editable('setValue', params.newValue);
                                $popupControl.empty();
                            }
                        }
                    );
                }
                $popupControl
                    .on('hide', function () {
                        //todo: mb need destroy editor
                        if($body){
                            $body.off('keydown');
                        }
                        $popupControl.off('hide').off('save').editable('destroy').remove();
                        $(this).remove();
                    });

                var value = $elem.editable('getValue')[key];
                if (typeof value !== 'string') {
                    value = value.toString();
                }
                if (isMarkupSupport) {
                    value = helpersModule.newLineSymbolsToBr(value);
                }
                $popupControl
                    .editable('setValue', value)
                    .editable('show');
                var $textArea = $popupControl.next('div').find('textarea');
                if (!isAllowEdit) {
                    $textArea.attr('readonly', true);
                } else if (isMarkupSupport) {
                    editor = new wysihtml5.Editor($textArea.get(0));
                    var eventData = {};
                    editor.on('load', function () {
                        $body = $textArea.siblings('iframe').eq(1).contents().find('body');

                        $body
                            .on('keydown', eventData, helpersModule.addSignToIframe)
                            .on('keydown', function (e) {
                                if (e.keyCode === optionsModule.getKeyCode('escape')) {
                                    $popupControl.editable('hide');
                                }
                            });
                    });
                }
                return false;
            }
        });
})(undefined, helpersModule, optionsModule);