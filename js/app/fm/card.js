var Card = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            $obj: null
        },
        getCaption: function () {
            this.$obj.children('caption').html();
        },
        getKey: function () {
            this.$obj.children('key').html();
        },
        getCols: function () {
            this.$obj.children('cols').html();
        },
        getRows: function () {
            this.$obj.children('rows').html();
        },
        getCol: function () {
            this.$obj.children('col').html();
        },
        getRow: function () {
            this.$obj.children('row').html();
        },
        getCellWidth: function () {
            this.$obj.children('cellWidth').html();
        },
        getCellHeight: function () {
            this.$obj.children('cellHeight').html();
        },
        getFixedWidth: function () {
            this.$obj.children('fixedWidth').html();
        },
        getFixedHeight: function () {
            this.$obj.children('fixedHeight').html();
        },
        getCaptionReadProc: function () {
            this.$obj.children('captionReadProc').html();
        },
        getVisible: function () {
            this.$obj.children('visible').html();
        }
    });
})(Backbone);