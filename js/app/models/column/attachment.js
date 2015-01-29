/**
 * Class AttachmentColumnRO
 * @class
 * @augments ColumnRO
 */
var AttachmentColumnRO = (function () {
    'use strict';
    return ColumnRO.extend(
        /** @lends AttachmentColumnRO */
        {
            defaults: {
                id: null,
                key: null
            },
            /**
             * @constructs
             */
            initialize: function () {
                this.set('key', this.getKey());
            },
            _$editableElements: null,
            /**
             * @param $editableElements {jQuery|null}
             * @private
             * @description for the destruction of unused objects and events
             */
            _persistLinkToEditableElements: function ($editableElements) {
                this._$editableElements = $editableElements;
            },

            /**
             * @method destroy
             */
            destroy: function () {
                if (this._$editableElements) {
                    this._$editableElements.off('init').off('save').editable('destroy');
                }
                delete this._readData;
                delete this._columnCustomProperties;
                this.set('columnProperties', null);
                this.set('id', null);
                this.set('key', null);
            },
            /**
             * @override
             * @returns {Boolean}
             */
            isEdit: function () {
                return true;
            },
            /**
             * @override
             * @returns {string}
             */
            getFromKey: function () {
                return this.getKey();
            },
            /**
             * @override
             * @returns {Function}
             */
            getJsFn: function () {
                var _this = this;
                return function ($cnt, view) {
                    var $editableElements = $cnt.find('.' + _this._getUniqueClass());
                    _this._persistLinkToEditableElements($editableElements);
                    $editableElements.editable({
                        type: 'text',
                        mode: 'inline',
                        name: _this.getKey(),
                        showbuttons: false,
                        disabled: true,
                        title: _this.getCaption(),
                        view: _this.getView(),
                        fromID: null,
                        fromName: null,
                        toName: null,
                        toID: null

                    });
                };
            },
            /**
             * @override
             * @returns {string}
             */
            getVisibleCaption: function () {
                return 'Вложения';
            },
            /**
             * @override
             * @returns {string|null}
             */
            getDefault: function () {
                return null;
            },
            /**
             * @override
             * @returns {string}
             */
            getView: function () {
                return 'attachments.xml';
            },
            /**
             * @override
             * @returns {string}
             */
            getHeaderCLass: function () {
                return 'fa-paperclip';
            },
            /**
             * @override
             * @returns {string}
             */
            getKey: function () {
                return 'numattachments';
            },
            /**
             * @override
             * @returns {string}
             */
            getCardKey: function () {
                return '';
            },
            /**
             * @override
             * @returns {Boolean}
             */
            isRequired: function () {
                return false;
            },
            /**
             * @override
             * @returns {string}
             */
            getCaption: function () {
                return 'Вложения';
            },
            /**
             * @override
             * @returns {string}
             */
            getEditType: function () {
                return 'attachments_edit_type';
            },
            /**
             * @override
             * @returns {Object}
             */
            getHeaderOptions: function () {
                return {
                    'data-id': this.getKey(),
                    'class': 'sorter-text'
                };
            },
            /**
             * @override
             * @returns {string}
             */
            getClass: function () {
                var className = 'grid-button';
                if (!this.isEdit()) {
                    className += ' not-changed';
                }
                return className;
            },
            /**
             * @override
             * @returns {boolean}
             * @protected
             */
            _isVisibleInAllField: function () {
                return false;
            }

        });
})();