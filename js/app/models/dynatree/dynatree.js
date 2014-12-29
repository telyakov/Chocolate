var DynatreeModel = (function (Backbone, undefined) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            $el: null,
            options: null
        },
        hasInfoPanel: function () {
            var options = this.get('options');
            if (options.infoPanel === undefined) {
                return false;
            } else {
                return options.infoPanel;
            }
        },
        getNodes: function () {
            return this.get('options').children ?
                this.get('options').children :
                this.get('$el').data().editable.options.source;
        },
        getSql: function () {
            return this.get('options').sql;
        },
        isExpandNodes: function () {
            return this.get('options').expand_nodes?
                this.get('options').expand_nodes:
                true;
        },
        isSelectAll: function () {
            return this.get('options').select_all;
        },
        isRestoreState: function () {
            return this.get('options').restore_state ?
                this.get('options').restore_state :
                true;
        },
        getSeparator: function () {
            return this.get('options').separator?
                this.get('options').separator:
                '|';
        },
        getRootID: function () {
            return this.get('options').root_id;
        },
        getTitle: function () {
            return this.get('options').title;
        },
        getColumnTitle: function () {
            return this.get('options').column_title ?
                this.get('options').column_title :
                'text';
        },
        getColumnID: function () {
            return this.get('options').column_id ?
                this.get('options').column_id :
                'id';
        },
        getColumnParentID: function () {
            return this.get('options').column_parent_id;
        },
        isSingleMode: function () {
            return this.get('options').selectMode === 1;
        },
        getInput: function () {
            var options = this.get('options');
            if (options.getInput === undefined) {
                return this.get('$el');
            } else {
                return options.getInput.apply(this.get('$el'));
            }
        },
        isDialogEvent: function () {
            var options = this.get('options');
            if (options.isDialogEvent === undefined) {
                return true;
            } else {
                return options.isDialogEvent;
            }
        },
        getTitleValue: function (node) {
            var options = this.get('options');

            if (options.getTitleValue === undefined) {
                return node[this.getColumnTitle()];
            } else {
                return options.getTitleValue.apply(this, [node]);
            }
        },
        getKey: function (node) {
            var options = this.get('options');
            if (options.getKey === undefined) {
                return node[this.getColumnID()];
            } else {
                return options.getKey.apply(this, [node]);
            }
        },
        getParentID: function (node) {
            var options = this.get('options');
            if (options.getParentID === undefined) {
                return node[this.getColumnParentID()];
            } else {
                return options.getParentID.apply(this, [node]);
            }
        },
        defaultValues: function () {
            var options = this.get('options');
            if (options.defaultValues === undefined) {
                return false;
            } else {
                return options.defaultValues.apply(this.get('$el'));
            }
        },
        okButton: function ($tree, $input, $checkbox, $select) {
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
        buildFromData: function (options) {
            this.set('options', options);
            var rawData = this.getNodes();
            return this.generateContent(rawData);
        },
        generateContent: function (rawData) {
            var options = this.get('options');
            var $content = $('<div>');
            var $input = this.getInput();
            var map = {},
                rootID = this.getRootID();
            var $treeCon = this.get('$el').parent(),
                $select = $treeCon.children('select'),
                $tree = $('<div>', {'class': 'widget-tree'}),
                _this = this,
                $panel;
            var defaultValues = this._getDefaultValues(), node, autoCompleteData= [], defaultsElements = [];
            for (var i in rawData) {

                if (rawData.hasOwnProperty(i)) {
                    node = rawData[i];
                    node.title = this.getTitleValue(node);
                    node.key = this.getKey(node);
                    node.desc = node.description;
                    if (defaultValues && ( (defaultValues.length > 1 || defaultValues[0]) || this.isSingleMode()) && $.inArray(node.key, defaultValues) !== -1) {
                        node.select = true;
                        defaultsElements.push(node);
                    } else {
                        node.select = false;
                    }
                    node.index = i;
                    node.icon = false;
                    node.parentid = this.getParentID(node);
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
            if (this.hasInfoPanel()) {
                $panel = $('<div class="widget-panel"></div>');
                options.onActivate = function (node) {
                    $panel.html(_this.createPanelElement(node.data));
                };

            }
            $tree.dynatree(options);
            if (this.isExpandNodes()) {
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
            if (this.hasInfoPanel()) {
                $tree.addClass('widget-tree-compact');
                var panelContent = '';
                for (var i in defaultsElements) {
                    if (defaultsElements.hasOwnProperty(i)) {
                        var node = defaultsElements[i];
                        panelContent += _this.createPanelElement(node);
                    }
                }
                $panel.html(panelContent);
                $content.append($tree);
                $content.append($panel);
            } else {
                $content.append($tree);
            }
            if (this.isDialogEvent()) {
                this.dialogEvent($content, $tree, $input, $checkbox, $select);
            }
            var $checkBoxWrapper = $('<div>', {
                'class': 'wizard-check-con'
            });
            $checkBoxWrapper.append($checkbox);
            $content.append($checkBoxWrapper);
            this
                .autoCompleteEvent($search, $tree, $content, autoCompleteData)
                .checkboxClickEvent($checkbox, $tree);
            $.data(this.getInput().get(0), 'dialog', $content);

            return $content;


        },
        loadFromCache: function ($dialog) {
            var $treeCon = this.get('$el').parent(),
                $input = this.getInput(),
                isRestoreState = this.isRestoreState();
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
        _getDefaultValues: function () {
            var defValues = this.defaultValues();
            if (defValues) {
                defValues = defValues.split(this.getSeparator());
            }
            return defValues;
        },
        createPanelElement: function (node) {
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
        dialogEvent: function ($content, $tree, $input, $checkbox, $select) {
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
                    OK: dynatree.okButton($tree, $input, $checkbox, $select),
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
        checkboxClickEvent: function ($checkbox, $tree) {
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
            return this;
        },
        autoCompleteEvent: function ($search, $tree, $content, autoCompleteData) {
            var dynatree = this;
            $search.autocomplete({
                delay: 100,
                source: function (request, response) {
                    var search = helpersModule.engToRus(request.term.toLowerCase()),
                        prepareResp = autoCompleteData.filter(function (item) {
                            var source = item.label.toLowerCase();
                            return source.indexOf(search) !== -1;
                        });
                    $content.find('.node-searched').removeClass('node-searched');
                    $content.find("[data-title*='" + search + "']").addClass('node-searched');
                    response(prepareResp);
                },
                close: function () {
                    $content.find('.node-searched').removeClass('node-searched');
                },
                select: function (event, ui) {
                    $content.find('.node-searched').removeClass('node-searched');
                    var id = ui.item.id,
                        tree = $tree.dynatree("getTree"),
                        node = tree.getNodeByKey(id);
                    node.select(true);
                    node.activate();
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
                }
            });
            return dynatree;
        }
    });
})(Backbone, undefined);