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
        /**
         *
         * @param {HTMLTableElement} table
         * @param {Number} index
         * @returns {{semantic: {0: Array, 1: Array, 2: Array}, array: Array}}
         */
        getCells: function (table, index) {
            var ei = _private.tableElemIndex,
                result = {
                    semantic: {
                        0: [],//head
                        1: [],//body
                        2: []//footer
                    },
                    //keep a ref in a flat array for easy access
                    'array': []
                },
                tbodyRegex = _private.tbodyRegex,
                theadRegex = _private.theadRegex,
                tdsSemanticBody = result.semantic[ei.body],
                tdsSemanticHead = result.semantic[ei.head];

            var count = 0,
                length = table.rows.length,
                i,
                td;
            for (i = 0; i < length; i += 1) {

                td = table.rows[i].cells[index];
                //if the row has no cells dont error out;
                if (td === undefined) {
                    continue;
                }
                var parentNodeName = td.parentNode.parentNode.nodeName;
                result.array.push(td);
                //faster to leave out ^ and $ in the regular expression
                if (tbodyRegex.test(parentNodeName)) {
                    tdsSemanticBody.push(td);

                } else if (theadRegex.test(parentNodeName)) {
                    tdsSemanticHead.push(td);

                } else if (_private.tfootRegex.test(parentNodeName)) {
                    result.semantic[ei.foot].push(td);
                }

                count = i;
            }

            var colgroup = table.getElementsByTagName('colgroup');
            if (colgroup !== undefined) {
                for (i = 0, length = colgroup.length; i < length; i += 1) {
                    var col = colgroup[i].getElementsByTagName('col');
                    td = col[index];
                    result.array.push(td);
                }
            }

            var fthtd = table.getElementsByTagName('fthfoot')[0];
            if (fthtd !== undefined) {

                var footer = fthtd.getElementsByTagName('fthrow'),
                    lng = footer.length;
                for (i = 0, length = lng; i < length; i += 1) {
                    fthtd = footer[i].getElementsByTagName('fthtd');
                    td = fthtd[index];
                    result.array.push(td);
                }
            }
            return result;
        },
        /**
         *
         * @param {Node} a
         * @param {Node} b
         */
        swapCells: function (a, b) {
            a.parentNode.insertBefore(b, a);
        },
        /**
         *
         * @param {HTMLTableElement[]} tables
         * @param {Number} from
         * @param {Number} to
         */
        swapTableCols: function (tables, from, to) {
            tables.forEach(
                /** @param {HTMLTableElement}table */
                    function (table) {
                    _private.swapCols(table, from, to);
                });
        },
        /**
         *
         * @param {HTMLTableElement} table
         * @param {Number} from
         * @param {Number} to
         */
        swapCols: function (table, from, to) {
            var cells = _private.getCells(table, from).array,
                i,
                row,
                j,
                length;
            if (from < to) {
                for (i = from; i < to; i += 1) {
                    row = _private.getCells(table, i + 1);
                    for (j = 0, length = row.array.length; j < length; j += 1) {
                        _private.swapCells(cells[j], row.array[j]);
                    }
                }
            }
            else if (from !== to) {
                for (i = from; i > to; i -= 1) {
                    row = _private.getCells(table, i - 1);
                    for (j = 0, length = row.array.length; j < length; j += 1) {
                        _private.swapCells(row.array[j], cells[j]);
                    }
                }
            }
        },
        /**
         *
         * @param {HTMLTableElement[]} tables
         * @param {Array} positions
         */
        hideTableCols: function (tables, positions) {
            tables.forEach(
                /** @param {HTMLTableElement} table */
                    function (table) {
                    _private.hideCols(table, positions);
                });
        },
        /**
         *
         * @param {HTMLTableElement} table
         * @param {Array} positions
         */
        hideCols: function (table, positions) {
            _private.setCellDisplay(table, positions, 'none');
        },
        /**
         *
         * @param {HTMLTableElement} table
         * @param {Array} positions
         * @param {String} display
         */
        setCellDisplay: function (table, positions, display) {
            positions.forEach(
                /** @param {Number} pos */
                    function (pos) {
                    _private.getCells(table, pos).array
                        .forEach(
                        /**
                         *
                         * @param {HTMLElement} cell
                         */
                            function (cell) {
                            cell.style.display = display;
                        });
                });
        },
        /**
         *
         * @param {HTMLTableElement} table
         * @param {Array} positions
         */
        showCols: function (table, positions) {
            _private.setCellDisplay(table, positions, '');
        }, /**
         *
         * @param {HTMLTableElement[]} tables
         * @param {Array} positions
         */
        showTableCols: function (tables, positions) {
            tables.forEach(
                /** @param {HTMLTableElement} table */
                function (table) {
                _private.showCols(table, positions);
            });
        }
    };
    return {
        /**
         *
         * @param {HTMLTableElement} table
         * @param {Number} from
         * @param {Number} to
         */
        swapCols: function (table, from, to) {
            _private.swapCols(table, from, to);
        },
        /**
         *
         * @param {HTMLTableElement[]} tables
         * @param {Number} from
         * @param {Number} to
         */
        swapTableCols: function (tables, from, to) {
            _private.swapTableCols(tables, from, to);
        },
        /**
         *
         * @param {HTMLTableElement[]} tables
         * @param {Array} positions
         */
        hideTableCols: function (tables, positions) {
            _private.hideTableCols(tables, positions);
        },
        /**
         *
         * @param {HTMLTableElement[]} tables
         * @param {Array} positions
         */
        showTableCols: function (tables, positions) {
            _private.showTableCols(tables, positions);
        }
    };
})(undefined);
