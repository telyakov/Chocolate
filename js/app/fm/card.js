var Card = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            $obj: null
        },
        /**
         * @returns {jQuery}
         */
        getJqueryObj: function(){
            return this.get('$obj');
        },
        getCaption: function () {
            return this.getJqueryObj().children('caption').text();
        },
        getKey: function () {
            return this.getJqueryObj().children('key').text();
        },
        getCols: function () {
            return this.getJqueryObj().children('cols').text();
        },
        getRows: function () {
            return this.getJqueryObj().children('rows').text();
        },
        getCol: function () {
            return this.getJqueryObj().children('col').text();
        },
        getRow: function () {
            return this.getJqueryObj().children('row').text();
        },
        getCellWidth: function () {
            return this.getJqueryObj().children('cellWidth').text();
        },
        getCellHeight: function () {
            return this.getJqueryObj().children('cellHeight').text();
        },
        getFixedWidth: function () {
            return this.getJqueryObj().children('fixedWidth').text();
        },
        getFixedHeight: function () {
            return this.getJqueryObj().children('fixedHeight').text();
        },
        getCaptionReadProc: function () {
            return this.getJqueryObj().children('captionReadProc').text();
        },
        getVisible: function () {
            return this.getJqueryObj().children('visible').text();
        }
    });
})(Backbone);