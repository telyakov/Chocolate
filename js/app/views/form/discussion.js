var DiscussionView = (function (Backbone) {
    'use strict';
    return Backbone.View.extend({
        template: _.template(
          [
              '<form id="<%= formID%>" class="discussion-form" data-parent-view="<%= parentView %>" data-parent-id="<%= parentID %>">',
              '<section data-id="grid-section"><section class="discussion-content">',
              '</section></section>',
              '</form>',
              '<section class="discussion-footer">',
              '<textarea class="discussion-input"></textarea>',
              '<button class="discussion-submit">Отправить</button>',
              '</section>'
          ].join('')
        ),
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.$el = options.$el;
            this.model = options.model;
            if (options.dataParentId) {
                this.dataParentId = options.dataParentId;
            }
            this.render();
        },
        events: {},

        render: function () {
            var parentModel = this.model.get('parentModel'),
                parentID = this.model.get('parentId'),
                formID = helpersModule.uniqueID();
            this.$el.html(this.template({
                formID: formID,
                parentView: parentModel.getView(),
                parentID: parentID
            }));

            var form = facade.getFactoryModule().makeChDiscussionForm($('#' + formID));
            var defer = deferredModule.create(),
                deferID = deferredModule.save(defer);
            this.model.readProcEval(deferID);
            defer.done(function(data){
                var sql = data.sql;
            form.init(sql);
            form.refresh();
            });

        }
    });
})(Backbone);