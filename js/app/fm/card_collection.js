var CardCollections = (function (Backbone, Card) {
    'use strict';
    return Backbone.Collection.extend(
        /** @lends CardCollections */
        {
            model: Card,
            $obj: null,
            /**
             * @constructs
             */
            initialize: function (models, opts) {
                this.$obj = opts.$obj;
            },
            /**
             * @method destroy
             */
            destroy: function () {
                this.each(
                    /** @param card {Card} */
                        function (card) {
                        card.destroy();
                    });
                this.set('$obj', null);

            },
            /**
             * @returns {String}
             */
            getCaption: function () {
                return this.$obj.children('Caption').text();
            },
            /**
             * @returns {String}
             */
            getHeader: function () {
                return this.$obj.children('Header').text();
            },
            /**
             * @returns {String}
             */
            getButtonWidth: function () {
                return this.$obj.children('buttonWidth').text();
            },
            /**
             * @returns {String}
             */
            getButtonHeight: function () {
                return this.$obj.children('buttonHeight').text();
            },
            /**
             * @returns {String}
             */
            getAfterEdit: function () {
                return this.$obj.children('afterEdit').text();
            },
            /**
             * @returns {String}
             */
            getHeaderImage: function () {
                return this.$obj.children('headerImage').text();
            },
            /**
             * @returns {String}
             */
            getSmallHeader: function () {
                return this.$obj.children('smallHeader').text();
            },
            /**
             * @returns {String}
             */
            getHeaderHeight: function () {
                return this.$obj.children('headerHeight').text();
            },
            /**
             * @returns {String}
             */
            getCols: function () {
                return this.$obj.children('cols').text();
            },
            /**
             * @returns {String}
             */
            getRows: function () {
                return this.$obj.children('rows').text();
            },
            /**
             * @returns {String}
             */
            getAutoOpen: function () {
                return this.$obj.children('autoopen').text();
            }
        });
})(Backbone, Card);