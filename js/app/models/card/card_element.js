var CardElement = (function ($, Backbone, _, helpersModule, optionsModule, mediator) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            collection: null,
            column: null,
            key: null,
            model: null,
            view: null
        },
        id: null,
        posY: null,
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
        controlTemplate: _.template(
            [
                '<div class="table-td">',
                '<a tabindex="<%=tabindex %>" id="<%=id %>" rel="<%=key+\'_\' +pk %>" data-pk="<%=pk %>"',
                '></a>',
                '</div>'
            ].join('')
        ),
        headerCellTemplate: _.template(
            [
                '<div id="<%= id%>" data-x="<%= x %>" data-y="<%= y %>" ',
                'class="<%= class%>" data-rows="<%= rows%>" ',
                'style="<%= style%>" data-min-height="<%= height %>"',
                '>'
            ].join('')
        ),
        getColumn: function () {
            return this.get('column');
        },
        getControlID: function () {
            if (this.id === null) {
                this.id = helpersModule.uniqueID();
            }
            return this.id;
        },
        render: function (event, tabIndex, card, pk) {
            var response = {
                x: this.getX(),
                y: this.getY(),
                html: this.getHtml(card, tabIndex, pk),
                callback: this.getCallback(this.getControlID(), pk)
            };
            $.publish(event, response);
        },
        getX: function () {
            return parseInt(this.getColumn().getCardX(), 10);
        },
        getY: function () {
            if (this.posY) {
                return this.posY;
            }
            this.posY = this.getRecursiveY(0, this.getColumn());
            return this.posY;
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
        getHtml: function (card, tabIndex, pk) {
            var cellWidth = parseInt(100 / card.getCols(), 10),
                cols = card.getCols(),
                rows = card.getRows(),
                controlID = this.getControlID(),
                html = [],
                id = helpersModule.uniqueID();
            html.push(this.renderHeaderCell(id, cellWidth, cols, rows));
            html.push(this.renderLabel(id));
            html.push(this.renderBeginData());
            html.push(this.renderControl(pk, controlID, tabIndex));
            html.push(this.renderEndData());
            html.push('</div>');
            return html.join('');
        },
        renderHeaderCell: function (id, cellWidth, cols, rows) {
            var posX = this.getX(),
                style = [
                    'left:',
                    cellWidth * (posX - 1),
                    '%;width:',
                    this._getCellWidth(cellWidth, cols),
                    '%;'
                ].join('');
            return this.headerCellTemplate({
                id: id,
                x: posX,
                y: this.getY(),
                'class': this._getCellClass(),
                rows: this._countCellRows(rows),
                style: style,
                height: this.getMinHeight()
            });
        },
        _getCellWidth: function (cellWidth, cols) {
            var width = '' + this.getWidth();
            if (width.toLowerCase() === 'max') {
                return (cols - this.getX() + 1) * cellWidth;
            } else {
                return cellWidth * parseInt(width, 10);
            }
        },
        _getCellClass: function () {
            if (this.isStatic()) {
                return 'card-col card-static';
            }
            return 'card-col card-dynamic';
        },
        _countCellRows: function (rows) {
            var countRows = '' + this.getHeight();
            if (countRows.toLowerCase() === 'max') {
                return rows + this.getY() + 1;
            }
            return parseInt(countRows, 10);
        },
        getMinHeight: function () {
            return 42;
        },
        renderLabel: function (id) {
            return this.labelTemplate({
                id: id,
                caption: this.getCaption(),
                'isRequired': this.isRequired()
            });
        },
        renderBeginData: function () {
            return '<div class="card-input ' + this.getEditClass() + '">';
        },
        renderControl: function (pk, controlID, tabindex) {
            return this.controlTemplate({
                tabindex: tabindex,
                id: controlID,
                key: this.getColumn().get('key'),
                pk: pk
            });
        },
        renderEndData: function () {
            return '</div>';
        },
        validate: function ($cnt, value) {
            var $error = $cnt.closest('.card-col').children('label');
            if ($.trim(value) === '') {
                $error.addClass('card-error');
            } else {
                $error.removeClass('card-error');
            }
        },
        markAsNoChanged: function ($el) {
            $el.closest('.card-input').addClass('card-input-no-edit');
        },
        isStatic: function () {
            return true;
        },
        isSingle: function () {
            return this.getColumn().isSingle();
        },
        getName: function () {
            return this.getColumn().getVisibleKey();
        },
        getCaption: function () {
            return this.getColumn().getVisibleCaption();
        },
        isRequired: function () {
            return this.getColumn().isRequired();
        },

        getEditClass: function () {
            if (this.getAllowEdit()) {
                return '';
            }
            return 'card-input-no-edit';
        },
        getAllowEdit: function () {
            return this.getColumn().getRawAllowEdit();
        },
        getType: function () {
            return this.getColumn().getCardEditType();
        },
        getHeight: function () {
            return this.getColumn().getCardHeight();
        },
        getWidth: function () {
            return this.getColumn().getCardWidth();
        },
        getCallback: function () {
            return function () {
                mediator.publish(optionsModule.getChannel('logError'),
                    {
                        model: this,
                        error: 'not implemented getCallback method'
                    }
                );
            };
        }
    });
})(jQuery, Backbone, _, helpersModule, optionsModule, mediator);