var CardCollections = (function (Backbone) {
    'use strict';
    return Backbone.Collection.extend({
        model: Card,
        $obj: null,
        initialize: function(models, opts) {
            this.$obj = opts.$obj;
        },
        getCaption: function () {
            this.$obj.children('caption').html();
        },
        getHeader: function () {
            this.$obj.children('header').html();
        },
        getButtonWidth: function () {
            this.$obj.children('buttonWidth').html();
        },
        getButtonHeight: function () {
            this.$obj.children('buttonHeight').html();
        },
        getAfterEdit: function () {
            this.$obj.children('afterEdit').html();
        },
        getHeaderImage: function () {
            this.$obj.children('headerImage').html();
        },
        getSmallHeader: function () {
            this.$obj.children('smallHeader').html();
        },
        getHeaderHeight: function () {
            this.$obj.children('headerHeight').html();
        },
        getCols: function () {
            this.$obj.children('cols').html();
        },
        getRows: function () {
            this.$obj.children('rows').html();
        },
        getAutoOpen: function () {
            this.$obj.children('autoopen').html();
        }
    });
})(Backbone);