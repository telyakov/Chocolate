var MapView = (function (Backbone) {
    'use strict';
    return AbstractView.extend({
        template: _.template([
            '<form data-id="<%= view %>" id="<%= id%>">',
            '</form>'
        ].join('')),
        render: function () {
            var formID = helpersModule.uniqueID(),
                $form = $(this.template({
                    id: formID,
                    view: this.model.getView()
            }));
            this.$el.html($form);
            var menuView = new MenuView({
                model: this.model,
                $el: $form
            });
            var $sectionMap = $('<section>', {
                'data-id' : 'map'
            });
            var mapID = helpersModule.uniqueID(),
                $map = $('<div>', {
                    'class' : 'map',
                    id: mapID
                });
            $sectionMap.html($map);
            $form.append($sectionMap);

            jQuery.cachedScript = function( url, options ) {
                options = $.extend( options || {}, {
                    dataType: "script",
                    cache: true,
                    url: url
                });
                return jQuery.ajax( options );
            };
            $.cachedScript('http://api-maps.yandex.ru/2.1/?lang=ru_RU').done(
                function(){
                    ymaps.ready(function(){
                        var map = facade.getFactoryModule().makeChMap($map);
                        map.init(ymaps, '{}');
                    });
                } );


        }
    });
})(Backbone);