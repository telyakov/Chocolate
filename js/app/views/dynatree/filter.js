var FilterDynatreeView = (function (Backbone, $, optionsModule, deferredModule, undefined) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.model = options.model;
        },
        events: {},
        render: function () {
            var model = this.model,
                $input = model.getInput(),
                $dialog = $.data($input.get(0), 'dialog');
            if ($dialog !== undefined) {
                model.loadFromCache($dialog);
            } else {
                var defer = deferredModule.create(),
                    deferID = deferredModule.save(defer);
                mediator.publish(optionsModule.getChannel('socketRequest'), {
                    query: model.getSql(),
                    id: deferID,
                    type: optionsModule.getRequestType('deferred')
                });
                defer.done(function (res) {
                    model.generateContent(res.data);
                });
            }
        }
    });
})
(Backbone, jQuery, optionsModule, deferredModule, undefined);