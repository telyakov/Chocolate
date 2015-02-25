var CardRO = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend(
        /** @lends CardRO */
        {
            defaults: {
                card: null,
                key: null
            },
            /**
             * @public
             */
            destroy: function(){
                this.set('card', null);
                this.set('key', null);
            },
            /**
             * @returns {Boolean}
             */
            isVisible: function () {
                return interpreterModule.parseBooleanExpression(this.get('card').getVisible(), true);
            },
            /**
             * @returns {String}
             */
            getKey: function () {
                return this.get('card').getKey();
            },
            /**
             * @returns {boolean}
             */
            hasSaveButtons: function () {
                return this.getKey().toLowerCase() !== 'обсуждения';
            },
            /**
             * @returns {String}
             */
            getCaption: function () {
                return this.get('card').getCaption();
            },
            /**
             * @returns {String}
             */
            getCaptionReadProc: function () {
                return this.get('card').getCaptionReadProc();
            },
            /**
             * @returns {Number}
             */
            getCols: function () {
                return parseInt(this.get('card').getCols(), 10);
            },
            /**
             * @returns {Number}
             */
            getRows: function () {
                return parseInt(this.get('card').getRows(), 10);
            }
        });
})(Backbone);