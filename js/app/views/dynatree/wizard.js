var WizardDynatreeView = (function (Backbone, $) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this, 'render');
            //this.$el = options.$el;
            this.model = options.model;
            //this.render();
        },
        events: {},
        render: function (commandObj, $select, data) {
            var options = {
                isDialogEvent: false,
                defaultValues: function () {
                    return commandObj.usersidlist;
                },
                getInput: function () {
                    return $select;
                },
                column_title: 'name',
                root_id: 'parentid',
                column_id: 'id',
                infoPanel: true,
                separator: '|',
                children: data,
                checkbox: true
            };
            return this.model.buildFromData(options);
        }
    });
})
(Backbone, jQuery);