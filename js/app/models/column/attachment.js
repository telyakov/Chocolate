var AttachmentColumnRO = (function () {
    'use strict';
    return ColumnRO.extend({
        defaults: {
            id: null,
            key: null
        },
        initialize: function () {
            this.set('key', this.getKey());
        },
        isEdit: function () {
            return true;
        },
        getFromKey: function(){
            return this.getKey();
        },
        getJsFn: function () {
            var _this = this;
            return function ($cnt, view) {
                $cnt.find('.' + _this.getUniqueClass()).editable({
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
        getVisibleCaption: function () {
            return 'Вложения';
        },
        getDefault: function () {
            return null;
        },
        getView: function () {
            return 'attachments.xml';
        },

        getHeaderCLass: function () {
            return 'fa-paperclip';
        },
        getKey: function () {
            return 'numattachments';
        },
        getCardKey: function () {
            return '';
        },
        isRequired: function () {
            return false;
        },
        getCaption: function () {
            return 'Вложения';
        },
        getEditType: function () {
            return 'attachments_edit_type';
        },
        isVisibleInAllField: function () {
            return false;
        },
        getHeaderOptions: function () {
            return {
                'data-id': this.getKey(),
                'class': 'sorter-text'
            };
        },
        getClass: function () {
            var className = 'grid-button';
            if (!this.isEdit()) {
                className += ' not-changed';
            }
            return className;
        }

    });
})();