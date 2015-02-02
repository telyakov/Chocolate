var CardElement = (function ($, Backbone, _, helpersModule, optionsModule, mediator) {
    'use strict';
    return Backbone.Model.extend(
        /** @lends CardElement */
        {
            defaults: {
                collection: null,
                column: null,
                key: null,
                model: null,
                view: null
            },
            _id: null,
            _posY: null,
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
                    '<a tabindex="<%=tabindex %>" id="<%=id %>" data-pk="<%=pk %>"',
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
            /**
             * @method destroy
             */
            destroy: function () {
                delete this._id;
                delete this._posY;
                delete this.labelTemplate;
                delete this.controlTemplate;
                delete this.headerCellTemplate;
                this.set('collection', null);
                this.set('column', null);
                this.set('key', null);
                this.set('model', null);
                this.set('view', null);
            },
            /**
             *
             * @param event {String}
             * @param tabIndex {Number}
             * @param card {CardRO}
             * @param pk {String}
             */
            render: function (event, tabIndex, card, pk) {
                var response = {
                    x: this._getX(),
                    y: this._getY(),
                    html: this._getHtml(card, tabIndex, pk),
                    callback: this._getCallback(this._getControlID(), pk)
                };
                $.publish(event, response);
            },
            /**
             * @returns {ColumnRO}
             */
            getColumn: function () {
                return this.get('column');
            },
            /**
             * @returns {String}
             */
            getCaption: function () {
                return this.getColumn().getVisibleCaption();
            },
            /**
             * @returns {Boolean}
             */
            isRequired: function () {
                return this.getColumn().isRequired();
            },
            /**
             * @returns {string}
             */
            getEditClass: function () {
                if (this.getAllowEdit()) {
                    return '';
                }
                return 'card-input-no-edit';
            },
            /**
             * @returns {String}
             */
            getAllowEdit: function () {
                return this.getColumn().getRawAllowEdit();
            },
            /**
             * @returns {String}
             */
            getType: function () {
                return this.getColumn().getCardEditType();
            },
            /**
             * @returns {Number}
             */
            getHeight: function () {
                return this.getColumn().getCardHeight();
            },
            /**
             * @returns {Number}
             */
            getWidth: function () {
                return this.getColumn().getCardWidth();
            },
            /**
             * @param id {String}
             * @param cellWidth {Number}
             * @param cols {Number}
             * @param rows {Number}
             * @returns {String}
             * @protected
             */
            _renderHeaderCell: function (id, cellWidth, cols, rows) {
                var posX = this._getX(),
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
                    y: this._getY(),
                    'class': this._getCellClass(),
                    rows: this._countCellRows(rows),
                    style: style,
                    height: this._getMinHeight()
                });
            },
            /**
             * @returns {Number}
             * @protected
             */
            _getMinHeight: function () {
                return 42;
            },
            /**
             * @param id {String}
             * @returns {String}
             * @protected
             */
            _renderLabel: function (id) {
                return this.labelTemplate({
                    id: id,
                    caption: this.getCaption(),
                    isRequired: this.isRequired()
                });
            },
            /**
             * @returns {string}
             * @protected
             */
            _renderBeginData: function () {
                return '<div class="card-input ' + this.getEditClass() + '">';
            },
            /**
             * @param pk {String}
             * @param controlID {String}
             * @param tabIndex {Number}
             * @returns {String}
             * @protected
             */
            _renderControl: function (pk, controlID, tabIndex) {
                return this.controlTemplate({
                    tabindex: tabIndex,
                    id: controlID,
                    pk: pk
                });
            },
            /**
             * @returns {string}
             * @protected
             */
            _renderEndData: function () {
                return '</div>';
            },
            /**
             * @param $cnt {jQuery}
             * @param value {String}
             * @protected
             */
            validate: function ($cnt, value) {
                console.log($cnt, value)
                var $error = $cnt.closest('.card-col').children('label');
                if ($.trim(value) === '') {
                    $error.addClass('card-error');
                } else {
                    $error.removeClass('card-error');
                }
            },
            /**
             * @param $el {jQuery}
             * @protected
             */
            _markAsNoChanged: function ($el) {
                $el.closest('.card-input').addClass('card-input-no-edit');
            },
            /**
             * @returns {boolean}
             * @protected
             */
            _isStatic: function () {
                return true;
            },
            /**
             * @protected
             * @abstract
             * @returns {Function}
             */
            _getCallback: function () {
                return function () {
                    mediator.publish(optionsModule.getChannel('logError'),
                        {
                            model: this,
                            error: 'not implemented _getCallback method'
                        }
                    );
                };
            },
            /**
             * @returns {String}
             * @private
             */
            _getControlID: function () {
                if (this._id === null) {
                    this._id = helpersModule.uniqueID();
                }
                return this._id;
            },
            /**
             * @returns {Number}
             * @private
             */
            _getX: function () {
                return parseInt(this.getColumn().getCardX(), 10);
            },
            /**
             * @returns {Number}
             * @private
             */
            _getY: function () {
                if (this._posY) {
                    return this._posY;
                }
                this._posY = this._getRecursiveY(0, this.getColumn());
                return this._posY;
            },
            /**
             * @param curPosY {Number}
             * @param columnRO {ColumnRO}
             * @returns {Number}
             * @private
             */
            _getRecursiveY: function (curPosY, columnRO) {
                var posY = columnRO.getCardY();
                if (posY.indexOf('+') !== -1) {
                    var matches = posY.split('+'),
                        parentKey = matches[0].toLowerCase(),
                        digit = matches[1],
                        parentColumnRO = this.get('collection').findWhere({
                            key: parentKey
                        });
                    return this._getRecursiveY(curPosY + parseInt(digit, 10), parentColumnRO);
                } else {
                    return curPosY + parseInt(posY, 10);
                }
            },
            /**
             * @param card {CardRO}
             * @param tabIndex {String}
             * @param pk {String}
             * @returns {string}
             * @private
             */
            _getHtml: function (card, tabIndex, pk) {
                var cellWidth = parseInt(100 / card.getCols(), 10),
                    cols = card.getCols(),
                    rows = card.getRows(),
                    controlID = this._getControlID(),
                    html = [],
                    id = helpersModule.uniqueID();
                html.push(this._renderHeaderCell(id, cellWidth, cols, rows));
                html.push(this._renderLabel(id));
                html.push(this._renderBeginData());
                html.push(this._renderControl(pk, controlID, tabIndex));
                html.push(this._renderEndData());
                html.push('</div>');
                return html.join('');
            },
            /**
             * @param cellWidth {Number}
             * @param cols {Number}
             * @returns {number}
             * @private
             */
            _getCellWidth: function (cellWidth, cols) {
                var width = '' + this.getWidth();
                if (width.toLowerCase() === 'max') {
                    return (cols - this._getX() + 1) * cellWidth;
                } else {
                    return cellWidth * parseInt(width, 10);
                }
            },
            /**
             * @returns {string}
             * @private
             */
            _getCellClass: function () {
                if (this._isStatic()) {
                    return 'card-col card-static';
                }
                return 'card-col card-dynamic';
            },
            /**
             * @param rows {Number}
             * @returns {Number}
             * @private
             */
            _countCellRows: function (rows) {
                var countRows = '' + this.getHeight();
                if (countRows.toLowerCase() === 'max') {
                    return rows + this._getY() + 1;
                }
                return parseInt(countRows, 10);
            }
        });
})(jQuery, Backbone, _, helpersModule, optionsModule, mediator);
