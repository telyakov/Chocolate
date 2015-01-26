/**
 * Creates a new ActionsPropertiesCollection
 * @class
 */
var ActionsPropertiesCollection = (function (Backbone, ActionProperties) {
    'use strict';
    return Backbone.Collection.extend(
        /** @lends ActionsPropertiesCollection */
        {
            model: ActionProperties,
            /**
             * @method destroy
             */
            destroy: function () {
                this.each(
                    /** @param action {ActionProperties} */
                        function (action) {
                        action.destroy();
                    });
            },
            getData: function () {
                var result = [];
                this.each(
                    /** @param action {ActionProperties} */
                        function (action) {
                        result.push({
                            title: action.getCaption(),
                            cmd: action.getAction()
                        });
                    });
                result.push({
                    title: 'Экспорт в Excel',
                    cmd: 'ch.export2excel'
                });
                result.push({
                    title: 'Настройка',
                    cmd: 'ch.settings'
                });
                return result;
            }
        });
})(Backbone, ActionProperties);