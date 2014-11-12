function ChMap($map) {
    this.$map = $map;
    this.map = new ymaps.Map(this.$map.attr('id'), {
        center: [59.94, 30.31],
        zoom: 7
    });
    this._objects = null;
}
ChMap.prototype = {
    init: function (ymaps, encoded_data) {
        mediator.publish(optionsModule.getChannel('reflowTab'));
//        chApp.getDraw().reflowActiveTab();
        var points = json_parse(encoded_data, Chocolate.parse);
        this.map.controls
            // Кнопка изменения масштаба.
            .add('zoomControl', { left: 5, top: 5 });
        this.setPoints(points);

    },
    /**
     *
     * @param points
     * @param ch_messages_container {ChMessagesContainer}
     */
    refreshPoints: function (points, ch_messages_container) {
        var map = this.map;
        if (this._objects) {
            map.geoObjects.remove(this._objects);
        }
        var count = this.setPoints(points)
        ch_messages_container._sendSuccessMessage('Всего объектов на карте: ' + count, 0)
    },
    setPoints: function (points) {
        var map = this.map;
        var myGeoObjects = [];
        for (var i in points) {
            //TODO: передать на арбузные свойства
            var point = points[i];
            var lat = point.latitude,
                long = point.longitude,
                header = 'Договор № ' + point.contractid,
                body = point.address;
            if (lat && long) {
                myGeoObjects.push(new ymaps.GeoObject({
//                    geometry: {type: "Point", coordinates: [long, lat]}
                        geometry: {type: "Point", coordinates: [lat, long]},
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
}