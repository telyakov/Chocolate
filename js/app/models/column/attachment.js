var AttachmentColumnRO = (function (Backbone) {
    'use strict';
    return ColumnRO.extend({
        defaults: {
            id: null,
            key: null
        },
        isEdit: function () {
            return true;
        },
        initialize: function () {
            this.set('key', this.getKey());
        },
        getHeaderCLass: function () {
            return 'fa-paperclip';
        },
        getKey: function () {
            return 'numattachments';
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
                'data-grid-button': 1,
                'class': 'sorter-text'
            };
        },
        getClass: function () {
            var class_name = '';
            if (!this.isEdit()) {
                class_name += 'not-changed';
            }
            class_name += ' grid-button';
            return class_name;
        }

    });
})(Backbone);