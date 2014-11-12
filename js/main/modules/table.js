var tableModule = (function (undefined) {
    'use strict';
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
            var ei = _private.tableElemIndex,
                tds = {
                    'semantic': {
                        '0': [],//head
                        '1': [],//body
                        '2': []//footer
                    },
                    //keep a ref in a flat array for easy access
                    'array': []
                },
                tbodyRegex = _private.tbodyRegex,
                theadRegex = _private.theadRegex,
                tdsSemanticBody = tds.semantic[ei.body],
                tdsSemanticHead = tds.semantic[ei.head];

            var count = 0, i , length, td;
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

                } else if (_private.tfootRegex.test(parentNodeName)) {

                    tds.semantic[ei.foot].push(td);
                }

                count = i;
            }

            var colgroup = elem.getElementsByTagName('colgroup');
            if (colgroup !== undefined) {
                for (i = 0, length = colgroup.length; i < length; i++) {
                    var col = colgroup[i].getElementsByTagName('col');
                    td = col[index];
                    tds.array.push(td);
                }
            }

            var fthtd = elem.getElementsByTagName('fthfoot')[0];
            if (fthtd !== undefined) {

                var footer = fthtd.getElementsByTagName('fthrow'),
                    lng = footer.length;
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
        swapTableCols: function (tables, from, to) {
            tables.forEach(function (elem) {
                _private.swapCols(elem, from, to);
            });
        },
        swapCols: function (elem, from, to) {
            var cells = _private.getCells(elem, from).array,
                i,
                row,
                j,
                length;
            if (from < to) {
                for (i = from; i < to; i++) {
                    row = _private.getCells(elem, i + 1);
                    for (j = 0, length = row.array.length; j < length; j++) {
                        _private.swapCells(cells[j], row.array[j]);
                    }
                }
            }
            else if (from !== to) {
                for (i = from; i > to; i--) {
                    row = _private.getCells(elem, i - 1);
                    for (j = 0, length = row.array.length; j < length; j++) {
                        _private.swapCells(row.array[j], cells[j]);
                    }
                }
            }
        },
        hideTableCols: function (tables, positions) {
            tables.forEach(function (elem) {
                _private.hideCols(elem, positions);
            });
        },
        hideCols: function (table, positions) {
            _private.setCellDisplay(table, positions, 'none');
        },
        setCellDisplay: function (table, positions, display) {
            positions.forEach(function (pos) {
                var cells = _private.getCells(table, pos);
                cells.array.forEach(function (c) {
                    c.style.display = display;
                });
            });
        },
        showCols: function (table, positions) {
            _private.setCellDisplay(table, positions, '');
        },
        showTableCols: function (tables, positions) {
            tables.forEach(function (elem) {
                _private.showCols(elem, positions);
            });
        }
    };
    return {
        swapCols: function (el, from, to) {
            _private.swapCols(el, from, to);
        },
        swapTableCols: function (tables, from, to) {
            _private.swapTableCols(tables, from, to);
        },
        hideTableCols: function (tables, positions) {
            _private.hideTableCols(tables, positions);
        },
        showTableCols: function (tables, positions) {
            _private.showTableCols(tables, positions);
        }
    };
})(undefined);
