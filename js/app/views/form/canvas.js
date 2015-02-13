/**
 * Class CanvasView
 * @class
 * @augments AbstractView
 */
var CanvasView = (function (undefined, helpersModule, deferredModule, optionsModule, Math) {
    'use strict';
    return AbstractView.extend(
        /** @lends CanvasView */

        {
            template: _.template('<form data-id="<%= view %>" id="<%= id%>"></form>'),
            events: function () {
                return _.extend({}, AbstractView.prototype.events, {
                    'click canvas': function (e) {
                        var model = this.getModel(),
                            xPos,
                            yPos,
                            data = this._prepareData(model.getDBDataFromStorage()),
                            cellHeight = this._getCellHeight(),
                            cellWidth = this._getCellWidth(),
                            floorWidth = this._getFloorWidth();
                        if (e.offsetX === undefined) {
                            // this works for Firefox
                            var offset = $(this).offset();
                            xPos = e.pageX - offset.left;
                            yPos = e.pageY - offset.top;
                        }
                        else {
                            // works in Google Chrome
                            xPos = e.offsetX;
                            yPos = e.offsetY;
                        }
                        if (xPos >= floorWidth) {
                            var x = ( xPos - floorWidth) / cellWidth, y = yPos / cellHeight;
                            x = x - (x % 1);
                            y = y - (y % 1);
                            if (data[y][x] !== undefined) {
                                var pk = data[y][x].id;
                                model.trigger('open:card', pk);
                            }
                        }
                    }
                });
            },
            /**
             * @class CanvasView
             * @param {Object} options
             * @augments AbstractView
             * @constructs
             */
            initialize: function (options) {
                this._menuView = null;
                this._canvasID = helpersModule.uniqueID();
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
                this._canvasID = null;
                this.undelegateEvents();
                AbstractView.prototype.destroy.apply(this);
                this.events = null;
            },
            /**
             * @desc Render Canvas
             */
            render: function () {
                var $form = $(this.template({
                    id: this.getFormID(),
                    view: this.getModel().getView()
                }));
                this.$el.html($form);
                var menuView = new MenuView({
                    view: this,
                    $el: $form
                });
                this._persistReferenceToMenuView(menuView);
                menuView.render();
                var $sectionCanvas = $('<section>', {
                        'data-id': 'canvas',
                        'class': 'canvas'
                    }),
                    $map = $('<canvas>', {
                        'class': 'chocolate-canvas',
                        id: this._getCanvasID()
                    });
                $sectionCanvas.html($map);
                $form.append($sectionCanvas);
            },
            /**
             *
             * @override
             */
            refresh: function () {
                var model = this.getModel(),
                    _this = this,
                    data = this.getView().getFilterData();
                model
                    .runAsyncTaskBindingReadProc(data)
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
                                var data = res.data;
                                model.persistData(data, res.order);
                                _this._refreshDone(data);
                            })
                            .fail(
                            /** @param {string} error */
                                function (error) {
                                _this.showMessage({
                                    id: 3,
                                    msg: error
                                });
                            });
                    })
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
             * @param view {?MenuView}
             * @private
             */
            _persistReferenceToMenuView: function (view) {
                this._menuView = view;
            },
            /**
             * @returns {String}
             * @private
             */
            _getCanvasID: function () {
                return this._canvasID;
            },
            /**
             *
             * @returns {string}
             * @private
             */
            _getYKey: function () {
                return 'floor';
            },
            /**
             * @param {Object} data
             * @returns {Array}
             * @private
             */
            _prepareData: function (data) {
                var yKey = this._getYKey(),
                    xKey = 'prenumber',
                    data2storage = [],
                    i,
                    hasOwm = Object.prototype.hasOwnProperty;
                for (i in data) {
                    if (hasOwm.call(data, i)) {
                        var row = data[i],
                            y = parseInt(row[yKey], 10);
                        if (data2storage[y] === undefined) {
                            data2storage[y] = [];
                        }
                        var x = parseInt(row[xKey], 10);
                        data2storage[y][x] = row;
                    }
                }
                data2storage = data2storage.reverse();
                data2storage
                    .forEach(function (value, index) {
                        data = value
                            .sort(function (a, b) {
                                var aWeight = parseInt(a[xKey], 10);
                                var bWeight = parseInt(b[xKey], 10);
                                return aWeight > bWeight ? 1 : -1;
                            });

                        data2storage[index] = data;
                    });
                return data2storage;
            },

            /**
             *
             * @param {Object} data
             * @returns {*}
             * @private
             */
            _layout: function (data) {
                var canvas = $('#' + this._getCanvasID()).get(0),
                    ctx = canvas.getContext('2d');
                ctx.strokeStyle = '#ededed'; // меняем цвет рамки
                var columns = 0,
                    rows = 0,
                    counter = 0,
                    cellHeight = this._getCellHeight(),
                    cellWidth = this._getCellWidth(),
                    floorWidth = this._getFloorWidth();

                data.forEach(function (value) {
                    rows += 1;
                    counter = 0;
                    value.forEach(function () {
                        counter += 1;
                    });
                    columns = Math.max(counter, columns);
                });
                var cnvWidth = columns * cellWidth;
                canvas.height = rows * cellHeight;
                canvas.width = cnvWidth + floorWidth;
                ctx.beginPath();
                var defaultFillStyle = '#06629C',
                    defaultFont = '12px Segoe UI, sans-serif';
                for (var i = 0; i < rows; i += 1) {
                    var y = (i + 1) * cellHeight + 10;
                    for (var j = 0; j <= columns; j += 1) {
                        var x = j * cellWidth + floorWidth;
                        if (j < columns && data[i][j] !== undefined) {
                            /**
                             * @type CanvasRecordset
                             */
                            var cellData = data[i][j];
                            //ось
                            var axis = cellData.axis;
                            ctx.textAlign = "left";
                            ctx.fillStyle = defaultFillStyle;
                            ctx.font = ' 11px Segoe UI, sans-serif';
                            ctx.textBaseline = 'top';
                            ctx.fillText(axis, x + 3, y - cellHeight, cellWidth - 3);

                            //номер
                            var number = cellData.prenumber;
                            ctx.textAlign = "left";
                            ctx.fillStyle = defaultFillStyle;
                            ctx.font = 'bold 13px Segoe UI, sans-serif';
                            ctx.textBaseline = 'top';
                            ctx.fillText(number, x + 3, y - cellHeight + 15, cellWidth - 3);

                            //тип квартиры
                            var type = cellData.flatstypesname,
                                typeInt = parseInt(type, 10);
                            if (cellData.color === 'White') {
                                if (isNaN(typeInt)) {
                                    typeInt = 0;
                                }
                                ctx.textAlign = "center";
                                ctx.fillStyle = '#E0E0E0';
                                ctx.font = '48px Segoe UI, sans-serif';
                                ctx.textBaseline = 'middle';
                                ctx.fillText('' + typeInt, x + cellWidth / 2 - 5, y - cellHeight / 2 + 3, cellWidth - 3);
                            }
                            ctx.textAlign = "left";
                            ctx.fillStyle = defaultFillStyle;
                            ctx.font = defaultFont;
                            ctx.textBaseline = 'top';
                            ctx.fillText(type, x + 3, y - cellHeight + 30, cellWidth - 3);

                            //Цена
                            var cost = +cellData.costcurrent;
                            cost = helpersModule.formatNumber(cost.toString());
                            ctx.textAlign = "right";
                            ctx.fillStyle = defaultFillStyle;
                            ctx.font = defaultFont;
                            ctx.textBaseline = 'top';
                            ctx.fillText('' + cost, x + cellWidth - 13, y - cellHeight + 30, cellWidth);

                            //площадь
                            var planSqr = parseFloat(cellData.sqrplanreduced).toFixed(2);
                            if (planSqr === 'NaN') {
                                planSqr = 0;
                            }
                            ctx.textAlign = "right";
                            ctx.fillStyle = defaultFillStyle;
                            ctx.font = defaultFont;
                            ctx.textBaseline = 'top';
                            ctx.fillText(planSqr, x + cellWidth - 13, y - cellHeight + 45, cellWidth);

                            //площадь кухни
                            var kitchenSqr = parseFloat(cellData.sqrplanfullkitchen).toFixed(2);
                            if (kitchenSqr === 'NaN') {
                                kitchenSqr = 0;
                            }
                            ctx.textAlign = "right";
                            ctx.fillStyle = defaultFillStyle;
                            ctx.font = defaultFont;
                            ctx.textBaseline = 'top';
                            ctx.fillText(kitchenSqr, x + cellWidth - 13, y - cellHeight + 60, cellWidth);

                            //BL
                            var bl = cellData.bl;
                            ctx.textAlign = "left";
                            ctx.fillStyle = defaultFillStyle;
                            ctx.font = 'bold 12px Segoe UI, sans-serif';
                            ctx.textBaseline = 'top';
                            helpersModule.wrapText(ctx, bl, x, y - cellHeight + 75, cellWidth - 10);

                            //рисуем рамку(верхний, правый и нижний край)
                            ctx.beginPath();
                            ctx.strokeStyle = 'white';
                            ctx.fillStyle = cellData.color;
                            if (cellData.color === 'White') {
                                ctx.fillStyle = '#E4E4E4';
                            }
                            ctx.lineWidth = 1;
                            ctx.globalAlpha = 0.3;
                            ctx.moveTo(x + cellWidth - 10, y - cellHeight);
                            ctx.lineTo(x + cellWidth - 10, y - 3);
                            ctx.lineTo(x - 5, y - 3);
                            ctx.lineTo(x - 5, y - cellHeight);
                            ctx.lineTo(x + cellWidth - 10, y - cellHeight);
                            ctx.fill();
                            ctx.globalAlpha = 1;
                        }
                    }
                    //рисуем этаж
                    var floor = data[i][0][this._getYKey()];
                    ctx.textAlign = 'left';
                    ctx.fillStyle = defaultFillStyle;
                    ctx.font = '16px Segoe UI, sans-serif';
                    ctx.textBaseline = 'top';
                    ctx.fillText(floor, 0, y - cellHeight / 2 - 20, 30);
                }
                ctx.stroke();
                return this;
            },
            /**
             * @desc Get cell width in px
             * @returns {number}
             * @private
             */
            _getCellWidth: function () {
                return 150;
            },
            /**
             * @desc Get cell height in px
             * @returns {number}
             * @private
             */
            _getCellHeight: function () {
                return 100;
            },
            /**
             * @desc Get floor width in px
             * @returns {number}
             * @private
             */
            _getFloorWidth: function () {
                return 30;
            },
            /**
             * @param {Object} data
             * @private
             */
            _refreshDone: function (data) {
                this
                    ._layout(this._prepareData(data))
                    .showMessage({
                        id: 1,
                        msg: optionsModule.getMessage('successRefresh')
                    });
            }
        });
})(undefined, helpersModule, deferredModule, optionsModule, Math);