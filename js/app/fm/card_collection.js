var CardCollections = (function (Backbone, Card) {
    'use strict';
    return Backbone.Collection.extend({
        model: Card,
        $obj: null,
        initialize: function(models, opts) {
            this.$obj = opts.$obj;
        },
        getCaption: function () {
            return this.$obj.children('Caption').text();
        },
        getHeader: function () {
            return this.$obj.children('Header').text();
        },
        getButtonWidth: function () {
            return this.$obj.children('buttonWidth').text();
        },
        getButtonHeight: function () {
            return this.$obj.children('buttonHeight').text();
        },
        getAfterEdit: function () {
            return this.$obj.children('afterEdit').text();
        },
        getHeaderImage: function () {
            return this.$obj.children('headerImage').text();
        },
        getSmallHeader: function () {
            return this.$obj.children('smallHeader').text();
        },
        getHeaderHeight: function () {
            return this.$obj.children('headerHeight').text();
        },
        getCols: function () {
            return this.$obj.children('cols').text();
        },
        getRows: function () {
            return this.$obj.children('rows').text();
        },
        getAutoOpen: function () {
            return this.$obj.children('autoopen').text();
        }
    });
})(Backbone, Card);