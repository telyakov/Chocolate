/**
 * @param $canvas {jQuery}
 * @constructor
 */
function ChCanvas($canvas) {
    this.$canvas = $canvas;
    //todo: вынести в арбуз
    this.x_key = 'prenumber';
    this.y_key = 'floor';

}
ChCanvas.prototype.prepareData = function (data) {
    var y_key = this.y_key, x_key = this.x_key;
    var data2storage = [];
    for (var i in data) {
        var y = parseInt(data[i][y_key], 10);
        if (typeof(data2storage[y]) == 'undefined') {
            data2storage[y] = [];
        }
        var x = parseInt(data[i][x_key], 10);
        data2storage[y][x] = data[i];
    }
    data2storage = data2storage.reverse()
    data2storage.forEach(function (value, index) {
        data = value.sort(function (a, b) {
            var a_index = parseInt(a[x_key], 10);
            var b_index = parseInt(b[x_key], 10);
            return a_index > b_index ? 1 : -1;
        });

        data2storage[index] = data;
    });
    return data2storage;
};
/**
 * Прорисовка начинает
 * @param data array
 * @param options {ChCanvasOptions}
 */
ChCanvas.prototype.refreshData = function (data, options, model) {
    data = this.prepareData(data);
    var
        cell_height = options.cell_height,
        cell_width = options.cell_width;

    var floor_width = 30;
    var canvas = this.$canvas.get(0),
        ctx = canvas.getContext('2d');

    ctx.strokeStyle = '#ededed'; // меняем цвет рамки
    //горизонтальные линии
    var _this = this;

    function wrapText(context, text, marginLeft, marginTop, maxWidth, lineHeight) {
        var words = text.split(" ");
        var countWords = words.length;
        var line = "";
        for (var n = 0; n < countWords; n++) {
            var testLine = line + words[n] + " ";
            var testWidth = context.measureText(testLine).width;
            if (testWidth > maxWidth) {
                context.fillText(line, marginLeft, marginTop);
                line = words[n] + " ";
                marginTop += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        context.fillText(line, marginLeft, marginTop);
    }

    function layout(ctx) {
        var colls = 0;
        var rows = 0;
        var colls_counter = 0;

        data.forEach(function (value, index) {
            rows++;
            colls_counter = 0;
            value.forEach(function (value, index) {
                colls_counter++
            })
            colls = Math.max(colls_counter, colls);
        })
        var cnv_height = rows * cell_height;
        var cnv_width = colls * cell_width;
        canvas.height = cnv_height;
        canvas.width = cnv_width + floor_width;
        ctx.beginPath();
//        ctx.strokeStyle = '#ededed'; // меняем цвет рамки
        for (var i = 0; i < rows; i++) {
            var y = (i + 1) * cell_height + 10;
            for (var j = 0; j <= colls; j++) {
                var x = j * cell_width + floor_width;
                if (j < colls && typeof(data[i][j]) != 'undefined') {
//                    Рисуем ячейку
                    var cell_data = data[i][j];
                    //ось
                    var axis = cell_data['axis'];
                    ctx.textAlign = "left";
                    ctx.fillStyle = '#06629C';
                    ctx.font = ' 11px Segoe UI, sans-serif';
                    ctx.textBaseline = 'top';
                    ctx.fillText(axis, x + 3, y - cell_height, cell_width - 3, cell_height)

                    //номер
                    var number = cell_data['prenumber'];
                    ctx.textAlign = "left";
                    ctx.fillStyle = '#06629C';
                    ctx.font = 'bold 13px Segoe UI, sans-serif';
                    ctx.textBaseline = 'top';
                    ctx.fillText(number, x + 3, y - cell_height + 15, cell_width - 3, cell_height)

                    //тип квартиры
                    var type = cell_data['flatstypesname'];
                    var typeInt = parseInt(type, 10);
                    if (cell_data['color'] == 'White') {
                        if (isNaN(typeInt)) {
                            typeInt = 0;
                        }
                        ctx.textAlign = "center";
                        ctx.fillStyle = '#E0E0E0';
                        ctx.font = '48px Segoe UI, sans-serif';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(typeInt, x + cell_width / 2 - 5, y - cell_height / 2 + 3, cell_width - 3)
                    }
                    ctx.textAlign = "left";
                    ctx.fillStyle = '#06629C';
                    ctx.font = '12px Segoe UI, sans-serif';
                    ctx.textBaseline = 'top';
                    ctx.fillText(type, x + 3, y - cell_height + 30, cell_width - 3, cell_height)

                    //Цена
                    var cost = +cell_data['costcurrent'];
                    cost = cost.toString().replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g, "\$1 ");
                    ctx.textAlign = "right";
                    ctx.fillStyle = '#06629C';
                    ctx.font = '12px Segoe UI, sans-serif';
                    ctx.textBaseline = 'top';
                    ctx.fillText(cost, x + cell_width - 13, y - cell_height + 30, cell_width, cell_height)


                    //площадь
                    var plan_sqr = parseFloat(cell_data['sqrplanreduced']).toFixed(2);
                    if (isNaN(plan_sqr)) {
                        plan_sqr = 0;
                    }
                    ctx.textAlign = "right";
                    ctx.fillStyle = '#06629C';
                    ctx.font = '12px Segoe UI, sans-serif';
                    ctx.textBaseline = 'top';
                    ctx.fillText(plan_sqr, x + cell_width - 13, y - cell_height + 45, cell_width, cell_height)


                    //площадь кухни
                    var kitchen_sqr = parseFloat(cell_data['sqrplanfullkitchen']).toFixed(2);
                    if (isNaN(kitchen_sqr)) {
                        kitchen_sqr = 0;
                    }
                    ctx.textAlign = "right";
                    ctx.fillStyle = '#06629C';
                    ctx.font = '12px Segoe UI, sans-serif';
                    ctx.textBaseline = 'top';
                    ctx.fillText(kitchen_sqr, x + cell_width - 13, y - cell_height + 60, cell_width, cell_height)

                    //BL
                    var bl = cell_data['bl'];
                    ctx.textAlign = "left";
                    ctx.fillStyle = '#06629C';
                    ctx.font = 'bold 12px Segoe UI, sans-serif';
                    ctx.textBaseline = 'top';
                    wrapText(ctx, bl, x, y - cell_height + 75, cell_width - 10)

                    //рисуем рамку(верхний, правый и нижний край)
                    ctx.beginPath();
//                    ctx.strokeStyle  =cell_data['color'];
                    ctx.strokeStyle = 'white';
                    ctx.fillStyle = cell_data.color;
                    if (cell_data.color == 'White') {
                        ctx.fillStyle = '#E4E4E4';
                    }
                    ctx.lineWidth = 1;
//                    ctx.globalAlpha = 0.3;
                    ctx.globalAlpha = 0.3;
                    ctx.moveTo(x + cell_width - 10, y - cell_height);
                    ctx.lineTo(x + cell_width - 10, y - 3);
                    ctx.lineTo(x - 5, y - 3);
                    ctx.lineTo(x - 5, y - cell_height);
                    ctx.lineTo(x + cell_width - 10, y - cell_height);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            }
            //рисуем этаж
            var floor = data[i][0][_this.y_key];
            ctx.textAlign = "left";
            ctx.fillStyle = '#06629C';
            ctx.font = '16px Segoe UI, sans-serif';
            ctx.textBaseline = 'top';
            ctx.fillText(floor, 0, y - cell_height / 2 - 20, 30);

//            ctx.strokeStyle = '#99bce8'; // меняем цвет рамки
        }
        ctx.stroke();
    }

    layout(ctx);

    console.log( this.$canvas);
    this.$canvas.unbind('click');
    this.$canvas.on("click", function (e) {
        var xpos, ypos;
        if (e.offsetX == undefined) // this works for Firefox
        {
            xpos = e.pageX - $(this).offset().left;
            ypos = e.pageY - $(this).offset().top;
        }
        else                     // works in Google Chrome
        {
            xpos = e.offsetX;
            ypos = e.offsetY;
        }
        if (xpos >= floor_width) {

            var x = ( xpos - floor_width) / cell_width, y = ypos / cell_height;
            x = x - (x % 1);
            y = y - (y % 1);
            if (typeof( data[y][x]) !== 'undefined') {
                var pk = data[y][x].id;
                model.openCardHandler(pk);
            }
        }
    });
};

/**
 *
 * @param options {ChCanvasOptions}
 */
ChCanvas.prototype.init = function (options) {
};