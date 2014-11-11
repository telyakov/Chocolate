var tableModule = (function () {
    var _private = {
        tableElemIndex: {
            head: '0',
            body: '1',
            foot: '2'
        },
        tbodyRegex: /(tbody|TBODY)/,
        theadRegex: /(thead|THEAD)/,
        tfootRegex: /(tfoot|TFOOT|fthfoot)/,
        getCells: function (elem, index) {
            var ei = this.tableElemIndex,
                tds = {
                    //store where the cells came from
                    'semantic': {
                        '0': [],//head throws error if ei.head or ei['head']
                        '1': [],//body
                        '2': []//footer
                    },
                    //keep a ref in a flat array for easy access
                    'array': []
                },
            //cache regex, reduces looking up the chain
                tbodyRegex = this.tbodyRegex,
                theadRegex = this.theadRegex,
            //reduce looking up the chain, dont do it for the foot think thats more overhead since not many tables have a tfoot
                tdsSemanticBody = tds.semantic[ei.body],
                tdsSemanticHead = tds.semantic[ei.head];

            var count = 0;
            var i , length, td;
            for (i = 0, length = elem.rows.length; i < length; i++) {

                td = elem.rows[i].cells[index];

                //if the row has no cells dont error out;
                if (td === undefined) {
                    continue;
                }
                var parentNodeName = td.parentNode.parentNode.nodeName;
                tds.array.push(td);
                //faster to leave out ^ and $ in the regular expression
                if (tbodyRegex.test(parentNodeName)) {

                    tdsSemanticBody.push(td);

                } else if (theadRegex.test(parentNodeName)) {

                    tdsSemanticHead.push(td);

                } else if (this.tfootRegex.test(parentNodeName)) {

                    tds.semantic[ei.foot].push(td);
                }

                count = i;
            }

            var colgroup = elem.getElementsByTagName('colgroup');
            if (typeof  colgroup !== 'undefined') {
                var lng2 = colgroup.length;
                for (i = 0, length = lng2; i < length; i++) {
                    var col = colgroup[i].getElementsByTagName('col');
                    td = col[index];
                    tds.array.push(td);

                }
            }

            var fthtd = elem.getElementsByTagName('fthfoot')[0];
            if (typeof fthtd !== 'undefined') {

                var footer = fthtd.getElementsByTagName('fthrow');
                var lng = footer.length;
                for (i = 0, length = lng; i < length; i++) {
                    fthtd = footer[i].getElementsByTagName('fthtd');
                    td = fthtd[index];
                    tds.array.push(td);

                }
            }
            return tds;
        },
        swapCells: function (a, b) {
            a.parentNode.insertBefore(b, a);
        },
        swapColsManyTables: function (tables, from, to) {
            var _this = this;
            tables.forEach(function (elem, i, arr) {
                _this.swapCols(elem, from, to);
            });
        },
        swapCols: function (elem, from, to) {
            var currentColumnCollection = this.getCells(elem, from).array;
            var i, row2, j, length;
            if (from < to) {
                for (i = from; i < to; i++) {
                    row2 = this.getCells(elem, i + 1);
                    for (j = 0, length = row2.array.length; j < length; j++) {
                        this.swapCells(currentColumnCollection[j], row2.array[j]);
                    }
                }
            }
            else if (from !== to) {
                for (i = from; i > to; i--) {
                    row2 = this.getCells(elem, i - 1);
                    for (j = 0, length = row2.array.length; j < length; j++) {
                        this.swapCells(row2.array[j], currentColumnCollection[j]);
                    }
                }
            }
        },
        hideColsManyTables: function (tables, positions) {
            var _this = this;
            tables.forEach(function (elem, i, arr) {
                _this.hideCols(elem, positions);
            });
        },
        hideCols: function (table, positions) {
            this._setCellDisplay(table, positions, 'none');
        },
        _setCellDisplay: function (table, positions, display) {
            var _this = this;
            positions.forEach(function (pos) {
                var cellsCollection = _this.getCells(table, pos);
                cellsCollection.array.forEach(function (cell) {
                    cell.style.display = display;
                });
            });
        },
        showCols: function (table, positions) {
            this._setCellDisplay(table, positions, '');
        },
        showColsManyTables: function (tables, positions) {
            var _this = this;
            tables.forEach(function (elem, i, arr) {
                _this.showCols(elem, positions);
            });
        }
    };
    return {
        swapCols: function(el, from, to){
            _private.swapCols(el, from, to);
        },
        swapTableCols: function(tables, from, to){
            _private.swapColsManyTables(tables, from, to);
        },
        hideTableCols: function(tables, positions){
            _private.hideColsManyTables(tables, positions);
        },
        showTableCols: function(tables, positions){
            _private.showColsManyTables(tables, positions);
        }
    };
})();
