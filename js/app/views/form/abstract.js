var AbstractView = (function (Backbone) {
    'use strict';
    return Backbone.View.extend({
        footerTemplate: _.template([
                '<footer class="grid-footer" data-id="grid-footer">',
                '<div class="footer-info" data-id="info"></div>',
                '<div class="footer-counter"></div>',
                '</footer>'
            ].join('')
        ),
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.$el = options.$el;
            this.model = options.model;
            console.log(this, this.model.getView());
            this.listenTo(this.model, 'refresh:form', function(data){
                console.log(data);
            });
            this.render();


        },
        events: {},
        render:function(){

        }
    });
})(Backbone);