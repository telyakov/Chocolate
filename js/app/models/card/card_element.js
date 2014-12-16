var CardElement = (function ($, Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return Backbone.Model.extend({
        labelTemplate: _.template([
                '<label for="<%= id%>"',
                '<% if(isRequired){ %>',
                ' class="required"><span class="required">*</span>',
                '<% }else{ %>',
                '>',
                '<% }%>',
                '<%= caption%></label>'
            ].join('')
        ),
        id: null,
        getControlID: function () {
            if (this.id === null) {
                this.id = helpersModule.uniqueID();
            }
            return this.id;
        },
        defaults: {
            collection: null,
            column: null,
            key: null
        },
        getMinHeight: function () {
            return 42;
        },
        isStatic: function () {
            return true;
        },
        isSingle: function () {
            return this.get('column').isSingle();
        },

        getName: function () {
            return this.get('column').getVisibleKey();
        },

        renderEndData: function () {
            return '</div>';
        },
        processBeforeRender: function (id) {
            return this.labelTemplate({
                id: id,
                caption: this.getCaption(),
                'isRequired': this.isRequired()
            });
        },
        getCaption: function () {
            return this.get('column').getVisibleCaption();
        },
        isRequired: function () {
            return this.get('column').isRequired();
        },

        renderBeginData: function () {
            return '<div class="card-input ' + this.getEditClass() + '">';
        },

        getEditClass: function () {
            if (this.getAllowEdit()) {
                return '';
            }
            return 'card-input-no-edit';
        },

        getAllowEdit: function () {
            return this.get('column').getRawAllowEdit();
        },

        getType: function () {
            return this.get('column').getCardEditType();
        },

        getX: function () {
            return parseInt(this.get('column').getCardX(), 10);
        },
        posY: null,
        getY: function () {
            if (this.posY) {
                return this.posY;
            }
            var posY = this.getRecursiveY(0, this.get('column'));
            this.posY = posY;
            return posY;
        },

        getRecursiveY: function (curPosY, columnRO) {
            var posY = columnRO.getCardY();
            if (posY.indexOf('+') !== -1) {
                var matches = posY.split('+'),
                    parentKey = matches[0].toLowerCase(),
                    digit = matches[1],
                    parentColumnRO = this.get('collection').findWhere({
                        key: parentKey
                    });
                return this.getRecursiveY(curPosY + parseInt(digit, 10), parentColumnRO);
            } else {
                return curPosY + parseInt(posY, 10);
            }
        },

        getHeight: function () {
            return this.get('column').getCardHeight();
        },

        getWidth: function () {
            return this.get('column').getCardWidth();
        },
        getCallback: function (controlID, pk) {
            return function () {
            };
        },
        getHtml: function (card, tabIndex, pk, controlID) {
            var cellWidth = parseInt(100 / card.getCols(), 10),
                cols = card.getCols(),
                rows = card.getRows();
            return this.createCell(tabIndex, cellWidth, cols, rows, pk, controlID);
        },


        createCell: function (tabIndex, cellWidth, cols, rows, pk, controlID) {
            var html = [],
                id = helpersModule.uniqueID();
            html.push(this.renderTopCell(id, cellWidth, cols, rows));
            html.push(this.processBeforeRender(id));
            html.push(this.renderBeginData());
            html.push(this.renderControl(pk, controlID, tabIndex));
            html.push(this.renderEndData());
            html.push('</div>');
            return html.join('');
        },
        controlTemplate: _.template(
            [
                '<div class="table-td">',
                '<a tabindex="<%=tabindex %>" id="<%=id %>" rel="<%=key+\'_\' +pk %>" data-pk="<%=pk %>"',
                '></a>',
                '</div>'
            ].join('')
        ),
        renderControl: function (pk, controlID, tabindex) {
            return this.controlTemplate({
                tabindex: tabindex,
                id: controlID,
                key: this.get('column').get('key'),
                pk: pk
            });
        },
        headerCellTemplate: _.template(
            [
                '<div id="<%= id%>" data-x="<%= x %>" data-y="<%= y %>" ',
                'class="<%= class%>" data-rows="<%= rows%>" ',
                'style="<%= style%>" data-min-height="<%= height %>"',
                '>'
            ].join('')
        ),
        renderTopCell: function (id, cellWidth, cols, rows) {
            var posX = this.getX(),
                style = [
                    'left:',
                    cellWidth * (posX - 1),
                    '%;width:',
                    this.getCellWidth(cellWidth, cols),
                    '%;'
                ].join('');
            return this.headerCellTemplate({
                id: id,
                x: posX,
                y: this.getY(),
                'class': this.getCellClass(),
                rows: this.countCellRows(rows),
                style: style,
                height: this.getMinHeight()
            });
        },

        getCellWidth: function (cellWidth, cols) {
            var width = '' + this.getWidth();
            if (width.toLowerCase() === 'max') {
                return (cols - this.getX() + 1) * cellWidth;
            } else {
                return cellWidth + parseInt(width, 10);
            }
        },

        getCellClass: function () {
            if (this.isStatic()) {
                return 'card-col card-static';
            }
            return 'card-col card-dynamic';
        },
        countCellRows: function (rows) {
            var countRows = '' + this.getHeight();
            if (countRows.toLowerCase() === 'max') {
                return rows + this.getY() + 1;
            }
            return parseInt(countRows, 10);
        },
        render: function (event, tabIndex, card, pk) {
            var controlID = this.getControlID();
            var response = {
                x: this.getX(),
                y: this.getY(),
                html: this.getHtml(card, tabIndex, pk, controlID),
                callback: this.getCallback(controlID, pk)
            };
            $.publish(event, response);
        }
    });
})(jQuery, Backbone, helpersModule, FilterProperties, bindModule);