var MapView = (function (Backbone) {
    'use strict';
    return AbstractView.extend({
        template: _.template([
            '<form data-id="<%= view %>" id="<%= id%>">',
            '</form>'
        ].join('')),
        render: function () {
            var formID = this.getFormID(),
                $form = $(this.template({
                    id: formID,
                    view: this.model.getView()
                })),
                _this = this;
            this.$el.html($form);
            var menuView = new MenuView({
                view: this,
                $el: $form
            });
            var $sectionMap = $('<section>', {
                'data-id': 'map'
            });
            var mapID = helpersModule.uniqueID(),
                $map = $('<div>', {
                    'class': 'map',
                    id: mapID
                });
            $sectionMap.html($map);
            $form.append($sectionMap);

            jQuery.cachedScript = function (url, options) {
                options = $.extend(options || {}, {
                    dataType: "script",
                    cache: true,
                    url: url
                });
                return jQuery.ajax(options);
            };
            $.cachedScript('http://api-maps.yandex.ru/2.1/?lang=ru_RU').done(
                function () {
                    ymaps.ready(function () {
                        var map = new ymaps.Map(mapID, {
                            center: [59.94, 30.31],
                            zoom: 7
                        });
                        //todo: add real data
                        _this.init(ymaps, '{}', map);
                        map.container.fitToViewport();
                    });
                });


        },
        _objects: null,
        init: function (ymaps, encoded_data, map) {
            mediator.publish(optionsModule.getChannel('reflowTab'));
            var points = json_parse(encoded_data, Chocolate.parse);
            map.controls
                .add('zoomControl', {left: 5, top: 5});
            this.setPoints(points, map);

        },
        refreshPoints: function (points, ch_messages_container, map) {
            if (this._objects) {
                map.geoObjects.remove(this._objects);
            }
            var count = this.setPoints(points);
            ch_messages_container._sendSuccessMessage('Всего объектов на карте: ' + count, 0);
        },
        setPoints: function (points, map) {
            var myGeoObjects = [];
            for (var i in points) {
                //TODO: передать на арбузные свойства
                var point = points[i];
                var lat = point.latitude,
                    longitude = point.longitude,
                    header = 'Договор № ' + point.contractid,
                    body = point.address;
                if (lat && longitude) {
                    myGeoObjects.push(new ymaps.GeoObject({
//                    geometry: {type: "Point", coordinates: [long, lat]}
                            geometry: {type: "Point", coordinates: [lat, longitude]},
                            properties: {
                                hintContent: body,
                                balloonContentHeader: header,
                                balloonContentBody: body,
                                clusterCaption: header
                            }
                        },
                        {
                            preset: 'twirl#violetIcon'
                        }
                    ));
                }
            }

            var clusterer = new ymaps.Clusterer(
                {
                    clusterDisableClickZoom: true,
                    preset: 'twirl#invertedVioletClusterIcons'
                }
            );
            clusterer.add(myGeoObjects);
            this._objects = clusterer;
            map.geoObjects.add(clusterer);
            return myGeoObjects.length;
        }
    });
})(Backbone);