var DiscussionView = (function (Backbone) {
    'use strict';
    return AbstractView.extend({
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
            var defer = this.model.deferReadProc();
            defer.done(function(data){
                var sql = data.sql;
            form.init(sql);
            form.refresh();
            });

        }
    });
})(Backbone);