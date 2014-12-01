var AttachmentColumnRO = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            id: null,
            key: null
        },
        initialize: function() {
            this.set('key', this.getKey());
        },
        getHeaderCLass: function(){
            return 'fa-paperclip';
        },
        getKey: function(){
            return 'numattachments';
        },
        isRequired: function(){
                return false;
        },
        getCaption: function(){
            return 'Вложения';
        },
        isVisibleInAllField: function(){
            return  false;
        },
        getHeaderOptions: function(){
            return {
                'data-id':this.getKey(),
                'data-grid-button': 1,
                'class': 'sorter-text'
            };
        }

    });
})(Backbone);