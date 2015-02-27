/**
 * Class FormColumnRO
 * @class
 * @augments ColumnRO
 */
var FormColumnRO = (function () {
    'use strict';
    return ColumnRO.extend(
        /** @lends FormColumnRO */
        {
            _$editableElements: null,
            /**
             * @method destroy
             * @override
             */
            destroy: function () {
                if (this._$editableElements) {
                    this._$editableElements.editable('destroy').remove();
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
             * @returns {Function}
             */
            getJsFn: function () {
                var _this = this;
                return function ($cnt, view, defer) {
                    var $editableElements = $cnt.find('.' + _this._getUniqueClass());
                    _this._persistLinkToEditableElements($editableElements);
                    $editableElements
                        .editable({
                            mode: 'inline',
                            name: _this.get('key'),
                            showbuttons: false,
                            onblur: 'submit',
                            disabled: true,
                            type: 'text',
                            title: _this.getVisibleCaption(),
                            view: helpersModule.getCorrectXmlName(_this.getView()),
                            fromID: _this.getFromId(),
                            fromName: _this.getFromName(),
                            toName: _this.getToName(),
                            toID: _this.getToId()
                        });
                    defer.resolve();

                };
            }
        });
})();