var MapView = (function ($, optionsModule, deferredModule) {
    'use strict';
    return AbstractView.extend(
        /** @lends MapView */
        {
            template: _.template('<form id="<%= id%>"></form>'),
                /**
             * @class MapView
             * @param {Object} options
             * @augments AbstractView
             * @constructs
             */
            initialize: function (options) {
                this._menuView = null;
                this._objects = null;
                this._map = null;
                AbstractView.prototype.initialize.call(this, options);
            },
            /**
             * @desc Destroy
             */
            destroy: function () {
                if (this._menuView) {
                    this._menuView.destroy();
                    delete this._menuView;
                }
                if (this._map) {
                    this._map.destroy();
                    this._map = null;
                }
                this._objects = null;
                this.undelegateEvents();
                AbstractView.prototype.destroy.apply(this);
            },
            /**
             * @desc Render Form
             */
            render: function () {
                var $form = $(this.template({
                        id: this.getFormID()
                    })),
                    _this = this;
                this.$el.html($form);
                var menuView = new MenuView({
                    view: this,
                    $el: $form
                });
                this._persistReferenceToMenuView(menuView);
                menuView.render();

                var mapID = helpersModule.uniqueID(),
                    $map = $('<div>', {
                        'class': 'map',
                        id: mapID
                    }),
                    $sectionMap = $('<section>', {
                        'data-id': 'map'
                    });
                $sectionMap.html($map);
                $form.append($sectionMap);

                $.cachedScript = function (url, options) {
                    options = $.extend(options || {}, {
                        dataType: 'script',
                        cache: true,
                        url: url
                    });
                    return $.ajax(options);
                };
                $.cachedScript('http://api-maps.yandex.ru/2.1/?lang=ru_RU').done(
                    function () {
                        ymaps.ready(function () {
                            /**
                             * @type {ymaps.Map}
                             */
                            var map = new ymaps.Map(mapID, {
                                center: [59.94, 30.31],
                                zoom: 7
                            });
                            _this._persistReferenceToMap(map);
                            _this._addControls();
                            map.container.fitToViewport();
                        });
                    });
            },
            /**
             * @returns {ymaps.Map|null}
             */
            getMap: function () {
                if (this._map) {
                    return this._map;
                }
                var error = 'Call method "getMap" before initialization map';
                this.publishError({
                    model: this,
                    error: error
                });
                return null;
            },
            /**
             * @override
             */
            changeFullScreenMode: function (e) {
                AbstractView.prototype.changeFullScreenMode.call(this, e);
                var map = this.getMap();
                if (map) {
                    map.container.fitToViewport();
                }
            },
            /**
             * @override
             */
            refresh: function () {
                var model = this.getModel(),
                    _this = this;
                model.
                    runAsyncTaskBindingReadProc(this.view.getFilterData())
                    .done(
                    /** @param {SqlBindingResponse} res */
                        function (res) {
                        var sql = res.sql,
                            deferredSaveObj = deferredModule.create();
                        mediator.publish(optionsModule.getChannel('socketRequest'), {
                            query: sql,
                            type: optionsModule.getRequestType('chFormRefresh'),
                            id: deferredModule.save(deferredSaveObj)
                        });
                        deferredSaveObj
                            .done(
                            /** {RecordsetDTO} @param res */
                                function (res) {
                                _this._refreshDone(res.data);
                            })
                            .fail(
                            /** @param {string} error */
                                function (error) {
                                _this.showMessage({
                                    id: 3,
                                    msg: error
                                });
                            });
                    }
                )
                    .fail(
                    /** @param {string} error */
                        function (error) {
                        _this.showMessage({
                            id: 3,
                            msg: error
                        });
                    });
            },
            /**
             * @desc For fight with leak memory
             * @param {ymaps.Map} map
             * @private
             */
            _persistReferenceToMap: function (map) {
                this._map = map;
            },
            /**
             * @desc For fight with leak memory
             * @param {MenuView} view
             * @private
             */
            _persistReferenceToMenuView: function (view) {
                this._menuView = view;
            },
            /**
             * @desc add controls to map and reflow tab
             * @private
             */
            _addControls: function () {
                mediator.publish(optionsModule.getChannel('reflowTab'));
                var map = this.getMap();
                if (map) {
                    map.controls.add('zoomControl', {left: 5, top: 5});
                }
            },
            /**
             * @param {Object} points
             * @private
             */
            _refreshDone: function (points) {
                if (this._objects) {
                    /**
                     *
                     * @type {ymaps.Map|null}
                     */
                    var map = this.getMap();
                    if (map) {
                        map.geoObjects.remove(this._objects);
                    }
                }
                var count = this._setPoints(points);
                this.showMessage({
                    msg: 'Всего объектов на карте: ' + count,
                    id: 1
                });
            },
            /**
             * @desc For fight with leak memory
             * @param {*} objects
             * @private
             */
            _persistReferenceToObjects: function (objects) {
                this._objects = objects;
            },
            /**
             *
             * @param {Object} points
             * @private
             * @returns {Number}
             */
            _setPoints: function (points) {
                var myGeoObjects = [],
                    map = this.getMap();
                if (map) {
                    var i,
                        hasOwn = Object.prototype.hasOwnProperty;
                    for (i in points) {
                        if (hasOwn.call(points, i)) {
                            var point = points[i],
                                lat = point.latitude,
                                longitude = point.longitude,
                                header = 'Договор № ' + point.contractid,
                                body = point.address;
                            if (lat && longitude) {
                                myGeoObjects.push(new ymaps.GeoObject({
                                        geometry: {
                                            type: 'Point',
                                            coordinates: [lat, longitude]
                                        },
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
                    }

                    var clusters = new ymaps.Clusterer(
                        {
                            clusterDisableClickZoom: true,
                            preset: 'twirl#invertedVioletClusterIcons'
                        }
                    );
                    clusters.add(myGeoObjects);
                    this._persistReferenceToObjects(clusters);
                    map.geoObjects.add(clusters);
                }

                return myGeoObjects.length;
            }
        });
})(jQuery, optionsModule, deferredModule);