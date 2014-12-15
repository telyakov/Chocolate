var Card = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            $obj: null
        },
        getCaption: function () {
            return this.get('$obj').children('caption').text();
        },
        getKey: function () {
            return this.get('$obj').children('key').text();
        },
        getCols: function () {
            return this.get('$obj').children('cols').text();
        },
        getRows: function () {
            return this.get('$obj').children('rows').text();
        },
        getCol: function () {
            return this.get('$obj').children('col').text();
        },
        getRow: function () {
            return this.get('$obj').children('row').text();
        },
        getCellWidth: function () {
            return this.get('$obj').children('cellWidth').text();
        },
        getCellHeight: function () {
            return this.get('$obj').children('cellHeight').text();
        },
        getFixedWidth: function () {
            return this.get('$obj').children('fixedWidth').text();
        },
        getFixedHeight: function () {
            return this.get('$obj').children('fixedHeight').text();
        },
        getCaptionReadProc: function () {
            return this.get('$obj').children('captionReadProc').text();
        },
        getVisible: function () {
            return this.get('$obj').children('visible').text();
        }
    });
})(Backbone);