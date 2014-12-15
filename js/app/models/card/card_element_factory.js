var CardElementFactory = (function () {
    'use strict';
    var _private = {
        make: function (column, collection) {
            var type = column.getCardEditType(),
                options = {
                    collection: collection,
                    column: column,
                    key: column.get('key')
                };
            switch(type){
                case 'text':
                    return new TextCardElement(options);
                case 'date':
                    return new DateCardElement(options);
                case 'datetime':
                    return new DateCardElement(options);
                case 'check':
                    return new CheckBoxCardElement(options);
                case 'textbox':
                    return new TextCardElement(options);
                case 'combobox':
                    return new SelectCardElement(options);
                case 'select':
                    return new SelectCardElement(options);
                case 'grid':
                    return new FormCardElement(options);
                case 'multimedia':
                    return new MultimediaCardElement(options);
                case 'line':
                    return new LineCardElement(options);
                case 'discussionform':
                    return new FormCardElement(options);
                default:
                    return new TextCardElement(options);
            }
        }
    };
    return {
        make: function (column, collection) {
            return _private.make(column, collection);
        }
    };
})();