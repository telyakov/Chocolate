var CanvasView = (function (Backbone) {
    'use strict';
    return AbstractView.extend({
        template: _.template([
            '<form data-id="<%= view %>" id="<%= id%>" ',
            'data-card-support="<%= isCardSupport %>"',
            '>',
            '</form>'
        ].join('')),
        render: function () {
            var formID = helpersModule.uniqueID(),
                $form = $(this.template({
                    id: formID,
                    view: this.model.getView(),
                    isCardSupport: this.model.hasCard()
                }));
            this.$el.html($form);
            var menuView = new MenuView({
                model: this.model,
                $el: $form
            });
            var $sectionCanvas = $('<section>', {
                'data-id' : 'canvas',
                'class' : 'canvas'
            });
            var canvasID = helpersModule.uniqueID(),
                $map = $('<canvas>', {
                    'class' : 'chocolate-canvas',
                    id: canvasID
                });
            $sectionCanvas.html($map);
            $form.append($sectionCanvas);
        }
    });
})(Backbone);