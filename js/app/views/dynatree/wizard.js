var WizardDynatreeView = (function (Backbone, $) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this);
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
                columnTitle: 'name',
                rootID: 'parentid',
                columnID: 'id',
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