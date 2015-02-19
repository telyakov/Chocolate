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
                            name: _this.get('key'),
                            disabled: false,
                            onblur: 'submit',
                            savenochange: false
                        },
                        isMarkupSupport = customProperties.get('markupSupport');
                    if (isMarkupSupport) {
                        options.type = 'wysihtml5';
                        options.mode = 'modal';
                        options.showbuttons = true;
                        options.wysihtml5 = {
                            toolbar: {
                                assSigh: helpersModule.generateHtmlIframeAddSignButton()
                            },
                            'font-styles': true,
                            emphasis: true,
                            lists: true,
                            html: false,
                            link: false,
                            image: false,
                            color: false
                        };
                    } else {
                        options.mode = 'inline';
                        options.showbuttons = false;
                        options.type = 'text';
                        options.tpl = '<textarea/>';
                    }
                    var $editableElements = $cnt.find('.' + _this._getUniqueClass());
                    _this._persistLinkToEditableElements($editableElements);

                    $editableElements.each(function () {
                        var $this = $(this),
                            pk = $this.attr('data-pk'),
                            isAllowEdit = _this.isAllowEdit(view, pk);
                        if (isMarkupSupport) {
                            options.title = _this._createTitleHtml(pk, _this.getVisibleCaption());
                        } else {
                            options.title = null;
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
                        } else {
                            options.disabled = true;
                        }
                        $this
                            .on('init', function textInit() {
                                if (!isAllowEdit) {
                                    _this.markAsNoChanged($this);
                                }
                                if (!isMarkupSupport) {
                                    var $button = $('<div/>', {
                                        'class': 'grid-modal-open form-modal-button',
                                        'data-name': _this.get('key')
                                    });
                                    _this._persistReferenceToModalButton($button);
                                    $button.on('click', function (e) {
                                            helpersModule.leaveFocus();
                                            _this._openTextColumnInModalView(e, pk, view);
                                        }
                                    );
                                    $this.parent().append($button);
                                }


                            })
                            .editable(options);
                    });
                    defer.resolve();
                };
            },
            /**
             *
             * @param {String|Number} pk
             * @param {String} caption
             * @returns {String}
             * @private
             */
            _createTitleHtml: function (pk, caption) {
                if (helpersModule.isNewRow(pk)) {
                    return caption;
                } else {
                    return caption + ' [' + pk + ']';
                }
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
                //todo: leak memory
                var $this = $(e.target);
                /**
                 *
                 * @type {FormModel}
                 */
                var model = view.model,
                    key = this.get('key'),
                    $elem = $this.prevAll('a'),
                    isAllowEdit = this.isAllowEdit(view, id),
                    caption = this.getVisibleCaption(),
                    $cell = $elem.parent(),
                    $popupControl = $('<a/>', {
                        'class': 'grid-textarea'
                    });
                helpersModule.leaveFocus();
                $popupControl.appendTo($cell.closest('section'));
                $popupControl.editable({
                    type: 'textarea',
                    mode: 'popup',
                    onblur: 'ignore',
                    savenochange: false,
                    title: this._createTitleHtml(id, caption),
                    tpl: helpersModule.generateTemplateTextArea(isAllowEdit)
                });
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
                    )
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
                $popupControl
                    .on('hide', function () {
                        $popupControl.off('hide').off('save').editable('destroy').remove();
                        $(this).remove();
                    });

                var value = $elem.editable('getValue')[key];
                if (typeof value !== 'string') {
                    value = value.toString();
                }
                $popupControl
                    .editable('setValue', value)
                    .editable('show');
                return false;
            }
        });
})(undefined, helpersModule, optionsModule);