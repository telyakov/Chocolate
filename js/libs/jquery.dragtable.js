(function ($) {
    $.widget("jb.dragtable", {
        //TODO: implement this
        eventWidgetPrefix: 'dragtable',
        options: {
            //used to the col headers, data contained in here is used to set / get the name of the col
            dataHeader: 'data-header',
            //class name that handles have
            handle: 'dragtable-drag-handle',
            //draggable items in cols, .dragtable-drag-handle has to match the handle options
            items: 'th:not( :has( .dragtable-drag-handle ) ), .dragtable-drag-handle',
            //if a col header as this class, cols cant be dragged past it
            boundary: 'dragtable-drag-boundary',
            //classnames that get applied to the real td, th
            placeholder: 'dragtable-col-placeholder',
            //the drag display will be appended to this element, some reason this is blank, also if your body tag has been zeroed off it wont be exact
            appendTarget: $(document.body),
            //if true,this will scroll the appendTarget offsetParent when the dragDisplay is dragged past its boundaries
            scroll: false,
            notDraggableCount: 1

        },
        // when a col is dragged use this to find the semantic elements, for speed
        tableElemIndex: {
            head: '0',
            body: '1',
            foot: '2'
        },
        tbodyRegex: /(tbody|TBODY)/,
        theadRegex: /(thead|THEAD)/,
        tfootRegex: /(tfoot|TFOOT|fthfoot)/,

        _create: function () {

            //used start/end of drag
            this.startIndex = null;
            this.endIndex = null;
            this.is_drag_enabled = false;
            //the references to the table cells that are getting dragged
            this.currentColumnCollection = [];
            //the references the position of the first element in the currentColunmCollection position
            this.currentColumnCollectionOffset = {};
            //the div wrapping the drag display table
            this.dragDisplay = $([]);
            this.parentElement = null;
            this.parentColumnCollection = null;
            this.start_index = null;
            this.end_index = null;
            var self = this,
                o = self.options,
                el = self.element;

            //offsetappendTarget catch for this
            if (o.appendTarget.length == 0) {
                o.appendTarget = $(document.body);
            }
            //grab the ths and the handles and bind them
            el.delegate(o.items, 'mousedown.' + self.widgetEventPrefix + ' touchstart', function (e) {
                if ((e.which == 1 && e.target.nodeName != 'DIV') || (e.which == 0 && e.target.nodeName == 'SPAN')) {
                    var $handle = $(this),
                    //Поправка на смешение по высоте
                        elementOffsetTop =  self.element.offset().top -30;
                    //make sure we are working with a th instead of a handle
                    if ($handle.hasClass(o.handle)) {
                        $handle = $handle.closest('th');
                        //change the target to the th, so the handler can pick up the offsetleft
                        e.currentTarget = $handle[0]
                    }
                    self._mousemoveHandler(e, elementOffsetTop, $handle);
                    //############
                }
            });

        },

        /*
         * e.currentTarget is used for figuring out offsetLeft
         * getCol must be called before this is
         *
         */
        _mousemoveHandler: function (e, elementOffsetTop,$handle) {
            if(!e.pageX &&  e.originalEvent.touches){
                e.pageX = e.originalEvent.touches[0].pageX;
            }
            if($(e.target).attr('data-id') ==ChOptions.keys.controlColumn){
                return false
            }
            //call this first, catch any drag display issues
            this._start(e);
            var offsetLeft = $(e.target).closest('form').offset().left;
            var self = this,
                o = self.options,
                prevMouseX = e.pageX,
                dragDisplayWidth = self.dragDisplay.outerWidth(),
                halfDragDisplayWidth = dragDisplayWidth / 2,
                appendTargetOP = o.appendTarget.offsetParent()[0],
                scroll = o.scroll,
            //get the col count, used to contain col swap
                colCount = self.element[ 0 ]
                    .getElementsByTagName('thead')[ 0 ]
                    .getElementsByTagName('tr')[ 0 ]
                    .getElementsByTagName('th')
                    .length - 1;

            $(document).bind('mousemove.' + self.widgetEventPrefix +' touchmove', function (e) {
                if(!e.pageX &&  e.originalEvent.touches){
                    e.pageX = e.originalEvent.touches[0].pageX;
                }
                if(self.is_drag_enabled == false){
                    self.getCol($handle.index())
                        .attr('tabindex', -1)
                        .focus()
                        .disableSelection()
                        .css({
                            top: elementOffsetTop,

                            left: e.pageX
                        })
                        .appendTo(o.appendTarget)
                    self.is_drag_enabled = true;
                }

                var columnPos = self._setCurrentColumnCollectionOffset(),
                    mouseXDiff = e.pageX - prevMouseX,
                    appendTarget = o.appendTarget[0],
                    left = ( parseInt(self.dragDisplay[0].style.left) + mouseXDiff  );

                self.dragDisplay.css('left', left)

                /*
                 * when moving left and e.pageX and prevMouseX are the same it will trigger right when moving left
                 *
                 * it should only swap cols when the col dragging is half over the prev/next col
                 */
                left = left - offsetLeft;
                if (e.pageX < prevMouseX) {
                    //move left
                    var threshold = columnPos.left - halfDragDisplayWidth;

                    //scroll left
                    if (left < ( appendTarget.clientWidth - dragDisplayWidth ) && scroll == true) {
                        var scrollLeft = appendTarget.scrollLeft + mouseXDiff
                        /*
                         * firefox does scroll the body with target being body but chome does
                         */
                        if (appendTarget.tagName == 'BODY') {
                            window.scroll(window.scrollX + scrollLeft, window.scrollY);
                        } else {
                            appendTarget.scrollLeft = scrollLeft;
                        }

                    }


                    if (left < threshold) {
                        if(self.start_index == null){
                            self.start_index = self.startIndex;
                        }
                        self.end_index =self.startIndex - 1;

                        self._swapHeaderCol(self.startIndex - 1);
                    }

                } else {
                    //move right

                    var threshold = columnPos.left + halfDragDisplayWidth;

                    //scroll right
                    if (left > (appendTarget.clientWidth - dragDisplayWidth ) && scroll == true) {
                        var scrollLeft = appendTarget.scrollLeft + mouseXDiff
                        /*
                         * firefox does scroll the body with target being body but chome does
                         */
                        if (appendTarget.tagName == 'BODY') {
                            window.scroll(window.scrollX + scrollLeft, window.scrollY);
                        } else {
                            appendTarget.scrollLeft = scrollLeft;
                        }

                    }
                    //move to the right only if x is greater than threshold and the current col isn' the last one
                    if (left > threshold && colCount != self.startIndex) {
                        if(self.start_index == null){
                            self.start_index = self.startIndex;
                        }
                        self.end_index =self.startIndex + 1;
                        self._swapHeaderCol(self.startIndex + 1);
                    }
                }
                //update mouse position
                prevMouseX = e.pageX;
                e.preventDefault();
                return false;

            })
                .one('mouseup.' + self.widgetEventPrefix + ' touchend', function (e) {
                    self._stop(e);
                });

        },
        _clearVars: function(){
            this.start_index = null;
            this.end_index = null;
            this.is_drag_enabled = false;
        },
        _start: function (e) {


            $(document)
                //move disableselection and cursor to default handlers of the start event
                .disableSelection()
                .css('cursor', 'move')


            return this._eventHelper('start', e, {
                //'draggable': $dragDisplay
            });


        },
        _stop: function (e) {
            if(this.start_index !== null &&  this.end_index !== null){
                var form = facade.getFactoryModule().makeChGridForm($(this.element).closest('form')),
                    $th = form.getFixedTable().children('thead').find('th'),
                    start,
                    end;
                if(this.start_index < this.end_index){
                    start = this.end_index;
                    end = this.end_index - 1 ;
                }else{
                    if( this.end_index ==0){
                        this.end_index =1;
                    }
                    start = this.end_index ;
                    end = this.end_index +1;
                }
                form.changeSettings( form.getPositionColumn( $th.eq(start).attr('data-id')), form.getPositionColumn( $th.eq(end).attr('data-id')));
                this._swapBodyCol(this.start_index, this.end_index);
            }
            this._clearVars();
            if (this._eventHelper('stop', e, {}) == true) {
                $(document)
                    .unbind('mousemove.' + this.widgetEventPrefix)
                    .unbind('touchmove')
                    .enableSelection()
                    .css('cursor', 'move');
                this.dropCol();
                this.dragDisplay.remove();
            }
            this.element.floatThead('reflow');

        },

        _setOption: function (option, value) {
            $.Widget.prototype._setOption.apply(this, arguments);

        },

        /*
         * get the selected index cell out of table row
         * needs to work as fast as possible. and performance gains in this method are worth the time
         * 	because its used to build the drag display and get the cells on col swap
         * http://jsperf.com/binary-regex-vs-string-equality/4
         */
        _getCells: function (elem, index) {
            var ei = this.tableElemIndex,
            //TODO: clean up this format
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

            //check does this col exsist
            if (index <= -1 || typeof elem.rows[0].cells[index] == undefined) {
                return tds;
            }

            var count = 0;
            for (var i = 0, length = elem.rows.length; i < length; i++) {

                var td = elem.rows[i].cells[index];

                //if the row has no cells dont error out;
                if (td == undefined) {
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

            var colgroup = elem.getElementsByTagName('colgroup')
            if (typeof  colgroup != 'undefined') {
                var lng2 = colgroup.length
                for (var i = 0, length = lng2; i < length; i++) {
                    var col = colgroup[i].getElementsByTagName('col')
                    var td = col[index]
                    tds.array.push(td);

                }
            }

            var fthtd = elem.getElementsByTagName('fthfoot')[0]
            if (typeof  fthtd != 'undefined') {

                var footer = fthtd.getElementsByTagName('fthrow');
                var lng = footer.length
                for (var i = 0, length = lng; i < length; i++) {
                    var fthtd = footer[i].getElementsByTagName('fthtd')
                    var td = fthtd[index]
                    tds.array.push(td);

                }
            }


            //console.timeEnd('getcells');
            return tds;
        },
        /*
         * returns all element attrs in a string key="value" key2="value"
         */
        _getElementAttributes: function (element) {

            var attrsString = '',
                attrs = element.attributes;
            for (var i = 0, length = attrs.length; i < length; i++) {
                attrsString += attrs[i].nodeName + '="' + attrs[i].nodeValue + '"';
            }
            return attrsString;
        },

        /*
         * faster than swap nodes
         * only works if a b parent are the same, works great for columns
         */
        _swapCells: function (a, b) {
            a.parentNode.insertBefore(b, a);
        },

        /*
         * used to trigger optional events
         */
        _eventHelper: function (eventName, eventObj, additionalData) {
            return this._trigger(
                eventName,
                eventObj,
                $.extend({
                    column: this.currentColumnCollection,
                    order: this.order(),
                    startIndex: this.startIndex,
                    endIndex: this.endIndex,
                    dragDisplay: this.dragDisplay,
                    columnOffset: this.currentColumnCollectionOffset
                }, additionalData)
            );
        },
        /*
         * build copy of table and attach the selected col to it, also removes the select col out of the table
         * @returns copy of table with the selected col
         *
         * populates self.dragDisplay
         * TODO: name this something better, like select col or get dragDisplay
         *
         */
        getCol: function (index) {
            //drag display is just simple html
            //console.profile('selectCol');

            //colHeader.addClass('ui-state-disabled')
            this.parentElement = $(this.element).closest('section').find('div[data-id=user-grid]>table')
            var $table = this.element,
                self = this,
                eIndex = self.tableElemIndex,
                placholderClassnames = ' ' + this.options.placeholder,
                $parent_table = this.parentElement;
            //BUG: IE thinks that this table is disabled, dont know how that happend
            self.dragDisplay = $('<table ' + self._getElementAttributes($table[0]) + '></table>')
                .addClass('dragtable-drag-col');

            //start and end are the same to start out with
            self.startIndex = self.endIndex = index;


            var cells = self._getCells($table[0], index);
            var parent_cells = self._getCells($parent_table[0], index);
            //Здесь сделать правильное получени столбцов
            self.currentColumnCollection = cells.array;
            self.parentColumnCollection = parent_cells.array

//            self.currentColumnCollection= self.currentColumnCollection[0]
            //################################
            var table_width = 200
            //TODO: convert to for in // its faster than each
            $.each(cells.semantic, function (k, collection) {
                //dont bother processing if there is nothing here

                if (collection.length == 0) {
                    return;
                }

                if (k == '0') {
                    var target = document.createElement('thead');
                    self.dragDisplay[0].appendChild(target);

                } else {
                    var target = document.createElement('tbody');
                    self.dragDisplay[0].appendChild(target);

                }
                //Добавляем только заголовок
                for (var i = 0, length = collection.length; i < 1 && k == 0; i++) {

                    var clone = collection[i].cloneNode(true);
                    collection[i].className += placholderClassnames;
                    var tr = document.createElement('tr');
                    tr.appendChild(clone);


                    target.appendChild(tr);
                    table_width = $(collection[i]).width()
                    //collection[i]=;
                }
            });

            this._setCurrentColumnCollectionOffset();
            self.dragDisplay.css('width', table_width)
            self.dragDisplay = $('<div class="dragtable-drag-wrapper"></div>').append(self.dragDisplay)
            return self.dragDisplay;
        },


        _setCurrentColumnCollectionOffset: function () {
//            return this.currentColumnCollectionOffset = null;
            return this.currentColumnCollectionOffset = $(this.currentColumnCollection[0]).position();
        },

        _swapBodyCol: function (from, to) {
            if (to < this.options.notDraggableCount) {
                to = this.options.notDraggableCount
            }
            if(from!=to){
                ChTableHelper.swapCols(this.parentElement[0], from, to);
                this._eventHelper('change', {});

                this.startIndex = this.endIndex;
            }

        },

        /*
         * move column left or right
         */
        _swapHeaderCol: function (to) {
            //cant swap if same position


            if (to == this.startIndex) {
                return false;
            }
//            console.log(to)
            if (to < this.options.notDraggableCount) {
                return false
            }
            var from = this.startIndex;
            this.endIndex = to;
            var th = this.element.find('th').eq(to);
            //check on th
            if (th.hasClass(this.options.boundary) == true) {
                return false;
            }
            //check handle element
            if (th.find('.' + this.options.handle).hasClass(this.options.boundary) == true) {
                return false;
            }

            if (this._eventHelper('breforechange', {}) === false) {
                return false;
            }
            ChTableHelper.swapCols(this.element[0], from, to);
            this._eventHelper('change', {});

            this.startIndex = this.endIndex;
        },
        /*
         * called when drag start is finished
         */
        dropCol: function () {
            //TODO: cache this when the option is set
            var regex = new RegExp("(?:^|\\s)" + this.options.placeholder + "(?!\\S)", 'g');
            //remove placeholder class
            //dont use jquery.fn.removeClass for performance reasons
            for (var i = 0, length = this.currentColumnCollection.length; i < length; i++) {
                var td = this.currentColumnCollection[i];

                td.className = td.className.replace(regex, '')
            }


        },
        /*
         * get / set the current order of the cols
         */
        order: function (order) {
            var self = this,
                elem = self.element,
                options = self.options,
                headers = elem.find('thead tr:first').children('th');


            if (order == undefined) {
                //get
                var ret = [];
                headers.each(function () {
                    var header = this.getAttribute(options.dataHeader);
                    if (header == null) {
                        //the attr is missing so grab the text and use that
                        header = $(this).text();
                    }

                    ret.push(header);

                });

                return ret;

            } else {
                //set
                //headers and order have to match up
                if (order.length != headers.length) {
                    return self;
                }
                for (var i = 0, length = order.length; i < length; i++) {

                    var start = headers.filter('[' + options.dataHeader + '=' + order[i] + ']').index();
                    if (start != -1) {
                        self.startIndex = start;

                        self.currentColumnCollection = self._getCells(self.element[0], start).array;

                        self._swapCol(i);
                    }


                }
                return self;
            }
        },

        destroy: function () {
//            console.log('destroy')
            var self = this,
                o = self.options;

            this.element.undelegate(o.items, 'mousedown.' + self.widgetEventPrefix);

            $(document).unbind('.' + self.widgetEventPrefix)

        }


    });

})(jQuery);


