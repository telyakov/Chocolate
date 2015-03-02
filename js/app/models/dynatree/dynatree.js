/**
 * Class DynatreeModel
 * @class
 */
var DynatreeModel = (function (Backbone, undefined, helpersModule) {
    'use strict';
    return Backbone.Model.extend(
        /** @lends DynatreeModel */

        {
            defaults: {
                $el: null,
                options: null
            },
            /**
             * @method destroy
             */
            destroy: function(){
                //todo: realize
                this.set('$el', null);
                this.set('options', null);
                console.log('dynatree destroy');
            },
            /**
             *
             * @returns {boolean}
             */
            isAlreadyInit: function(){
                var $input = this.getInput(),
                    $dialog = $.data($input.get(0), 'dialog');
                return $dialog !== undefined;
            },
            /**
             * @param options {Object}
             * @returns {jQuery}
             */
            buildFromData: function (options) {
                this.set('options', options);
                var rawData = this._getNodes();
                return this.generateContent(rawData);
            },
            /**
             * @param rawData {Object}
             * @returns {jQuery}
             */
            generateContent: function (rawData) {
                var options = this.get('options');
                var $content = $('<div>');
                var $input = this.getInput();
                var map = {},
                    rootID = this.getRootID(),
                    $el = this.get('$el'),
                    $treeCon = $el.parent(),
                    $select = $treeCon.children('select'),
                    $tree = $('<div>', {'class': 'widget-tree'}),
                    _this = this,
                    $panel;
                var defaultValues = this._getDefaultValues(),
                    node,
                    autoCompleteData = [],
                    defaultsElements = [],
                    i;
                for (i in rawData) {

                    if (rawData.hasOwnProperty(i)) {
                        node = rawData[i];
                        node.title = this._getTitleValue(node);
                        node.key = this.getKey(node);
                        node.desc = node.description;
                        if (( (defaultValues.length > 1 || defaultValues[0]) || this.isSingleMode()) && $.inArray(node.key, defaultValues) !== -1) {
                            node.select = true;
                            defaultsElements.push(node);
                        } else {
                            node.select = false;
                        }
                        node.index = i;
                        node.icon = false;
                        node.parentid = this._getParentID(node);
                        node.children = [];
                        map[node.key] = node.index;
                        autoCompleteData.push({label: node.title, id: node.key});
                    }
                }
                var data = [];
                for (var k in rawData) {
                    if (rawData.hasOwnProperty(k)) {
                        node = rawData[k];
                        if (typeof node.parentid !== 'undefined' && node.parentid !== rootID && node.parentid) {
                            rawData[map[node.parentid]].children.push(node);
                        } else {
                            data.push(node);
                        }
                    }
                }
                //todo: wtf?
                options.children = data;
                if (this._hasInfoPanel()) {
                    $panel = $('<div class="widget-panel"></div>');
                    options.onActivate = function (node) {
                        $panel.html(_this._createPanelElement(node.data));
                    };

                }
                options.onDblClick = function(node, event){
                    node.select(!node.isSelected());
                };
                $tree.dynatree(options);
                if (this._isExpandNodes()) {
                    $tree.dynatree("getRoot").visit(function (node) {
                        node.expand(true);
                    });
                }
                var $search = $('<input type="search">'),
                    $header = $('<div class="widget-header-tree"></div>'),
                    $checkbox = $('<span class="tree-checkbox"><input type="checkbox"><span class="tree-checkbox-caption">Выделить все</span></span>');
                $header.append($search);
                $header.append('<button class="active filter-button menu-button small-button"><span class="fa-eye" title="Показать элементы"></span></button>');
                $content.prepend($header);
                if (this._hasInfoPanel()) {
                    $tree.addClass('widget-tree-compact');
                    var panelContent = '';
                    for (i in defaultsElements) {
                        if (defaultsElements.hasOwnProperty(i)) {
                            node = defaultsElements[i];
                            panelContent += _this._createPanelElement(node);
                        }
                    }
                    $panel.html(panelContent);
                    $content.append($tree);
                    $content.append($panel);
                } else {
                    $content.append($tree);
                }
                if (this._isDialogEvent()) {
                    this._dialogWidgetInit($content, $tree, $input, $checkbox, $select);
                }
                var $checkBoxWrapper = $('<div>', {
                    'class': 'wizard-check-con'
                });
                $checkBoxWrapper.append($checkbox);
                $content.append($checkBoxWrapper);
                this._addAutoCompleteEventListener($search, $tree, $content, autoCompleteData);
                this._addCheckboxClickEventListener($checkbox, $tree);
                $.data(this.getInput().get(0), 'dialog', $content);

                return $content;


            },
            /**
             * @desc loading from cache
             */
            loadFromCache: function () {
                var $el = this.get('$el'),
                    $treeCon = $el.parent(),
                    $input = this.getInput(),
                    $dialog = $.data($input.get(0), 'dialog'),
                    isRestoreState = this._isRestoreState();
                var defValues = $input.val().split(this.getSeparator());
                if (!isRestoreState) {
                    $input.val('');
                    $treeCon.children('select').empty();
                }
                $dialog.children('.widget-tree').dynatree("getRoot").visit(function (node) {
                    if (isRestoreState && defValues.indexOf(node.data.key) !== -1) {
                        node.select(true);
                    } else {
                        node.select(false);
                    }
                });
                $dialog.dialog('option', 'position', {
                    at: 'center',
                    collision: 'fit',
                    my: 'center'
                });
                $dialog.dialog('open');
            },
            /**
             * @returns {String}
             */
            getSeparator: function () {
                return this.get('options').separator ?
                    this.get('options').separator :
                    '|';
            },
            /**
             * @returns {String}
             */
            getRootID: function () {
                return this.get('options').rootID;
            },
            /**
             * @returns {String}
             */
            getTitle: function () {
                return this.get('options').title;
            },
            /**
             * @returns {String}
             */
            getSql: function () {
                return this.get('options').sql;
            },
            /**
             * @returns {boolean}
             */
            isSingleMode: function () {
                return this.get('options').selectMode === 1;
            },
            /**
             * @returns {jQuery}
             */
            getInput: function () {
                var options = this.get('options');
                if (options.getInput === undefined) {
                    return this.get('$el');
                } else {
                    return options.getInput.apply(this.get('$el'));
                }
            },
            /**
             * @param node {Object}
             * @returns {string}
             */
            getKey: function (node) {
                var options = this.get('options');
                if (options.getKey === undefined) {
                    return node[this._getColumnID()];
                } else {
                    return options.getKey.apply(this, [node]);
                }
            },
            /**
             * @returns {Boolean}
             * @private
             */
            _hasInfoPanel: function () {
                var options = this.get('options');
                if (options.infoPanel === undefined) {
                    return false;
                } else {
                    return options.infoPanel;
                }
            },
            /**
             * @returns {Object}
             * @private
             */
            _getNodes: function () {
                return this.get('options').children ?
                    this.get('options').children :
                    this.get('$el').data().editable.options.source;
            },

            /**
             * @returns {Boolean}
             * @private
             */
            _isExpandNodes: function () {
                return this.get('options').expandNodes ?
                    this.get('options').expandNodes :
                    true;
            },
            /**
             * @returns {Boolean}
             */
            isSelectAll: function () {
                return this.get('options').selectAll;
            },
            /**
             * @returns {boolean}
             * @private
             */
            _isRestoreState: function () {
                return this.get('options').restoreState ?
                    this.get('options').restoreState :
                    true;
            },
            /**
             * @private
             * @returns {String}
             */
            _getColumnTitle: function () {
                return this.get('options').columnTitle ?
                    this.get('options').columnTitle :
                    'text';
            },
            /**
             *
             * @returns {String}
             * @private
             */
            _getColumnID: function () {
                return this.get('options').columnID ?
                    this.get('options').columnID :
                    'id';
            },
            /**
             *
             * @returns {String}
             * @private
             */
            _getColumnParentID: function () {
                return this.get('options').columnParentID;
            },
            /**
             * @returns {boolean}
             * @private
             */
            _isDialogEvent: function () {
                var options = this.get('options');
                if (options.isDialogEvent === undefined) {
                    return true;
                } else {
                    return options.isDialogEvent;
                }
            },
            /**
             * @param node {Object}
             * @returns {String}
             * @private
             */
            _getTitleValue: function (node) {
                return node[this._getColumnTitle()];
            },
            /**
             * @param node {Object}
             * @returns {string}
             * @private
             */
            _getParentID: function (node) {
                var options = this.get('options');
                if (options.getParentID === undefined) {
                    return node[this._getColumnParentID()];
                } else {
                    return options.getParentID.apply(this, [node]);
                }
            },
            /**
             * @param $tree {jQuery}
             * @param $input {jQuery}
             * @param $checkbox {jQuery}
             * @param $select {jQuery}
             * @returns {object}
             * @private
             */
            _getOkButtonOptions: function ($tree, $input, $checkbox, $select) {
                var options = this.get('options');
                if (options.okButton === undefined) {
                    var _this = this;
                    return {
                        'text': 'OK',
                        'class': 'wizard-active wizard-next-button',
                        click: function () {
                            var selectedNodes = $tree.dynatree("getSelectedNodes"),
                                val = '',
                                selectHtml = '',
                                isSelectAll = _this.isSelectAll();
                            for (var i in selectedNodes) {
                                if (selectedNodes.hasOwnProperty(i)) {
                                    var node = selectedNodes[i];
                                    if (isSelectAll || node.childList === null) {
                                        val += node.data.key + _this.getSeparator();
                                        selectHtml += "<option>" + node.data.title + "</option>";
                                    }
                                }
                            }
                            $input.val(val);
                            $select.html(selectHtml);
                            $checkbox.children('input').attr('checked', false);
                            $(this).dialog("close");
                        }
                    };
                } else {
                    return options.okButton.apply(this, [$tree, $input, $checkbox, $select]);
                }
            },
            /**
             * @returns {Array}
             * @private
             */
            _getDefaultValues: function () {
                var options = this.get('options');
                if (options.defaultValues === undefined) {
                    return [];
                } else {
                    var values = options.defaultValues.apply(this.get('$el'));
                    return values.split(this.getSeparator());
                }
            },
            /**
             * @param node {Object}
             * @returns {string}
             * @private
             */
            _createPanelElement: function (node) {
                var desc = '';
                if (node.desc) {
                    desc = node.desc;
                } else if (typeof node.data !== 'undefined' && node.data.description) {
                    desc = node.data.description;
                }
                return [
                    '<div class="widget-panel-elm"',
                    ' data-key="',
                    node.key,
                    '">',
                    '<div class="widget-panel-title">',
                    '<span>',
                    node.title,
                    '</span>',
                    '<span class="widget-elem-close fa-times"></span>',
                    '</div>',
                    '<div class="widget-panel-desc">',
                    desc,
                    '</div>',
                    '</div>'
                ].join('');
            },
            /**
             * @param $content {jQuery}
             * @param $tree {jQuery}
             * @param $input {jQuery}
             * @param $checkbox {jQuery}
             * @param $select {jQuery}
             * @private
             */
            _dialogWidgetInit: function ($content, $tree, $input, $checkbox, $select) {
                var dynatree = this;
                $content.dialog({
                    resizable: false,
                    'title': this.getTitle(),
                    'dialogClass': 'wizard-dialog',
                    modal: true,
                    close: function () {
                        $input.focus();
                    },
                    buttons: {
                        OK: dynatree._getOkButtonOptions($tree, $input, $checkbox, $select),
                        Отмена: {
                            'text': 'Отмена',
                            'class': 'wizard-cancel-button',
                            click: function () {
                                $checkbox.children('input').attr('checked', false);
                                $(this).dialog("close");
                            }
                        }
                    }
                });
            },
            /**
             * @param $checkbox {jQuery}
             * @param $tree {jQuery}
             * @private
             */
            _addCheckboxClickEventListener: function ($checkbox, $tree) {
                $checkbox.on('click', 'input', function () {
                    if ($(this).is(':checked')) {
                        $tree.dynatree("getRoot").visit(function (node) {
                            node.select(true);
                        });
                    } else {
                        $tree.dynatree("getRoot").visit(function (node) {
                            node.select(false);
                        });
                    }
                });
            },
            /**
             * @param $search {jQuery}
             * @param $tree {jQuery}
             * @param $content {jQuery}
             * @param autoCompleteData {Array}
             * @returns {DynatreeModel}
             * @private
             */
            _addAutoCompleteEventListener: function ($search, $tree, $content, autoCompleteData) {
                var dynatree = this,
                    searchClass = 'node-searched';
                $search.autocomplete({
                    delay: 100,
                    source: function (request, response) {
                        var search = helpersModule.engToRus(request.term.toLowerCase()),
                            prepareResp = autoCompleteData.filter(function (item) {
                                var source = item.label.toLowerCase();
                                return source.indexOf(search) !== -1;
                            });
                        $content.find(searchClass).removeClass(searchClass);
                        $content.find("[data-title*='" + search + "']").addClass(searchClass);
                        response(prepareResp);
                    },
                    close: function () {
                        $content.find(searchClass).removeClass(searchClass);
                    },
                    select: function (event, ui) {
                        $content.find(searchClass).removeClass(searchClass);
                        var id = ui.item.id,
                            tree = $tree.dynatree('getTree'),
                            node = tree.getNodeByKey(id);
                        node.select(true);
                        node.activate();
                        node.focus();
                        $search.focus();
                        var parent = node,
                            $li = $(node.li);
                        do {
                            $li.show();
                            parent = parent.parent;
                            if (parent) {
                                $li = $(parent.li);
                            }
                        }
                        while (parent);
                        ui.item.value ='';
                    }
                });
                return dynatree;
            }
        });
})(Backbone, undefined, helpersModule);