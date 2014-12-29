var CanvasView = (function (Backbone) {
    'use strict';
    return AbstractView.extend({
        template: _.template([
            '<form data-id="<%= view %>" id="<%= id%>" ',
            'data-card-support="<%= isCardSupport %>"',
            '>',
            '</form>'
        ].join('')),
        events: {
            'click canvas': function (e) {
                var xPos,
                    yPos,
                    data = this.prepareData(this.getDBDataFromStorage()),
                    cellHeight = this.getCellHeight(),
                    cellWidth = this.getCellWidth(),
                    floorWidth = this.getFloorWidth();
                if (e.offsetX === undefined) // this works for Firefox
                {
                    xPos = e.pageX - $(this).offset().left;
                    yPos = e.pageY - $(this).offset().top;
                }
                else                     // works in Google Chrome
                {
                    xPos = e.offsetX;
                    yPos = e.offsetY;
                }
                if (xPos >= floorWidth) {

                    var x = ( xPos - floorWidth) / cellWidth, y = yPos / cellHeight;
                    x = x - (x % 1);
                    y = y - (y % 1);
                    if (data[y][x] !== undefined) {
                        var pk = data[y][x].id;
                        this.openCardHandler(pk);
                    }
                }
            }
        },
        _canvasID: null,
        getCanvasID: function () {
            if (this._canvasID === null) {
                this._canvasID = helpersModule.uniqueID();
            }
            return this._canvasID;
        },
        render: function () {
            var formID = this.getFormID(),
                $form = $(this.template({
                    id: formID,
                    view: this.model.getView(),
                    isCardSupport: this.model.hasCard()
                }));
            this.$el.html($form);
            var menuView = new MenuView({
                view: this,
                $el: $form
            });
            var $sectionCanvas = $('<section>', {
                'data-id': 'canvas',
                'class': 'canvas'
            });
            var $map = $('<canvas>', {
                'class': 'chocolate-canvas',
                id: this.getCanvasID()
            });
            $sectionCanvas.html($map);
            $form.append($sectionCanvas);
        },
        getData: function () {

        },
        initData: function () {
            var model = this.model,
                _this = this,
                data = this.view.getFilterData();
            var defer = model.deferReadProc(data);
            defer.done(function (res) {
                var sql = res.sql;
                var deferRead = deferredModule.create(),
                    deferReadID = deferredModule.save(deferRead);
                mediator.publish(optionsModule.getChannel('socketRequest'), {
                    query: sql,
                    type: optionsModule.getRequestType('chFormRefresh'),
                    id: deferReadID
                });
                deferRead.done(function (res) {
                    var data = res.data;
                    _this.persistData(data, res.order);
                    _this.refreshData(data);
                });
            });
        },
        getYKey: function () {
            return 'floor';
        },
        prepareData: function (data) {
            var yKey = this.getYKey(),
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
        layout: function (data) {
            var canvas = $('#' + this.getCanvasID()).get(0),
                ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#ededed'; // меняем цвет рамки
            var columns = 0,
                rows = 0,
                counter = 0,
                cellHeight = this.getCellHeight(),
                cellWidth = this.getCellWidth(),
                floorWidth = this.getFloorWidth();

            data.forEach(function (value) {
                rows++;
                counter = 0;
                value.forEach(function () {
                    counter++;
                });
                columns = Math.max(counter, columns);
            });
            var cnvWidth = columns * cellWidth;
            canvas.height = rows * cellHeight;
            canvas.width = cnvWidth + floorWidth;
            ctx.beginPath();
            for (var i = 0; i < rows; i++) {
                var y = (i + 1) * cellHeight + 10;
                for (var j = 0; j <= columns; j++) {
                    var x = j * cellWidth + floorWidth;
                    if (j < columns && data[i][j] !== undefined) {
                        var cellData = data[i][j];
                        //ось
                        var axis = cellData.axis;
                        ctx.textAlign = "left";
                        ctx.fillStyle = '#06629C';
                        ctx.font = ' 11px Segoe UI, sans-serif';
                        ctx.textBaseline = 'top';
                        ctx.fillText(axis, x + 3, y - cellHeight, cellWidth - 3, cellHeight);

                        //номер
                        var number = cellData.prenumber;
                        ctx.textAlign = "left";
                        ctx.fillStyle = '#06629C';
                        ctx.font = 'bold 13px Segoe UI, sans-serif';
                        ctx.textBaseline = 'top';
                        ctx.fillText(number, x + 3, y - cellHeight + 15, cellWidth - 3, cellHeight);

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
                            ctx.fillText(typeInt, x + cellWidth / 2 - 5, y - cellHeight / 2 + 3, cellWidth - 3);
                        }
                        ctx.textAlign = "left";
                        ctx.fillStyle = '#06629C';
                        ctx.font = '12px Segoe UI, sans-serif';
                        ctx.textBaseline = 'top';
                        ctx.fillText(type, x + 3, y - cellHeight + 30, cellWidth - 3, cellHeight);

                        //Цена
                        var cost = +cellData.costcurrent;
                        cost = helpersModule.formatNumber(cost.toString());
                        ctx.textAlign = "right";
                        ctx.fillStyle = '#06629C';
                        ctx.font = '12px Segoe UI, sans-serif';
                        ctx.textBaseline = 'top';
                        ctx.fillText(cost, x + cellWidth - 13, y - cellHeight + 30, cellWidth, cellHeight);

                        //площадь
                        var planSqr = parseFloat(cellData.sqrplanreduced).toFixed(2);
                        if (isNaN(planSqr)) {
                            planSqr = 0;
                        }
                        ctx.textAlign = "right";
                        ctx.fillStyle = '#06629C';
                        ctx.font = '12px Segoe UI, sans-serif';
                        ctx.textBaseline = 'top';
                        ctx.fillText(planSqr, x + cellWidth - 13, y - cellHeight + 45, cellWidth, cellHeight);

                        //площадь кухни
                        var kitchenSqr = parseFloat(cellData.sqrplanfullkitchen).toFixed(2);
                        if (isNaN(kitchenSqr)) {
                            kitchenSqr = 0;
                        }
                        ctx.textAlign = "right";
                        ctx.fillStyle = '#06629C';
                        ctx.font = '12px Segoe UI, sans-serif';
                        ctx.textBaseline = 'top';
                        ctx.fillText(kitchenSqr, x + cellWidth - 13, y - cellHeight + 60, cellWidth, cellHeight);

                        //BL
                        var bl = cellData.bl;
                        ctx.textAlign = "left";
                        ctx.fillStyle = '#06629C';
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
                var floor = data[i][0][this.getYKey()];
                ctx.textAlign = 'left';
                ctx.fillStyle = '#06629C';
                ctx.font = '16px Segoe UI, sans-serif';
                ctx.textBaseline = 'top';
                ctx.fillText(floor, 0, y - cellHeight / 2 - 20, 30);
            }
            ctx.stroke();
        },
        getCellWidth: function () {
            return 150;
        },
        getCellHeight: function () {
            return 100;
        },
        getFloorWidth: function () {
            return 30;
        },
        refreshData: function (data) {
            this.layout(this.prepareData(data));
        },
        refresh: function () {
            this.initData();
        }
    });
})(Backbone);