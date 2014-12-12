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
        _refresh_timer_id: null,
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.$el = options.$el;
            this.model = options.model;
            this.view = options.view;
            this.listenTo(this.model, 'refresh:form', function (opts) {
                var isLazy = opts.isLazy;
                if (isLazy) {
                    if (this._refresh_timer_id) {
                        clearTimeout(this._refresh_timer_id);
                    }
                    var _this = this;
                    this._refresh_timer_id = setTimeout(function () {
                        _this.refresh();
                    }, 900);
                } else {
                    this.refresh();
                }
            });
            this.render();


        },
        events: {},
        refresh: function(){
            console.log('refresh');
        },
        showMessage: function(){
          console.log('show message');
        },
        render: function () {
        }
    });
})(Backbone);