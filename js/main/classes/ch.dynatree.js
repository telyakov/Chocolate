function ChDynatree($elm) {
    this.$elm = $elm;
    this.options = null;
    this.data = [];
    this.autoCompleteData = [];
    this.defaultsElements = [];
}
ChDynatree.prototype.init = function (options) {
    this.options = options;
    this.hasInfoPanel = function () {
        if (typeof options.infoPanel === 'undefined') {
            return false;
        } else {
            return options.infoPanel;
        }
    };
    this.getNodes = function () {
        return options.children;
    };
    this.getUrl = function () {
        return options.url;
    };
    this.isExpandNodes = function () {
        return options.expand_nodes;
    };
    this.isSelectAll = function () {
        return options.select_all;
    };
    this.isRestoreState = function () {
        return options.restore_state;
    };
    this.getSeparator = function () {
        return options.separator;
    };
    this.getRootID = function () {
        return options.root_id;
    };
    this.getTitle = function () {
        return options.title;
    };
    this.getColumnTitle = function () {
        return options.column_title;
    };
    this.getColumnID = function () {
        return options.column_id;
    };
    this.getColumnParentID = function () {
        return options.column_parent_id;
    };
    this.isSingleMode = function () {
        return this.options.selectMode === 1;
    };
    this.getInput = function () {
        if (typeof options.getInput === 'undefined') {
            return this.$elm.parent().children('input[type=hidden]');
        } else {
            return options.getInput.apply(this.$elm);
        }
    };
    this.isDialogEvent = function () {
        if (typeof options.isDialogEvent === 'undefined') {
            return true;
        } else {
            return options.isDialogEvent;
        }
    };
    this.getTitleValue = function (node) {
        if (typeof options.getTitleValue === 'undefined') {
            return node[this.getColumnTitle()];
        } else {
            return options.getTitleValue.apply(this, [node]);
        }
    };
    this.getKey = function (node) {
        if (typeof options.getKey === 'undefined') {
            return node[this.getColumnID()];
        } else {
            return options.getKey.apply(this, [node]);
        }
    };
    this.getParentID = function (node) {
        if (typeof options.getParentID === 'undefined') {
            return node[this.getColumnParentID()];
        } else {
            return options.getParentID.apply(this, [node]);
        }
    };
    this.defaultValues = function () {
        if (typeof options.defaultValues === 'undefined') {
            return false;
        } else {
            return options.defaultValues.apply(this.$elm);
        }
    };
    this.okButton = function ($tree, $input, $checkbox, $select) {
        if (typeof options.okButton === 'undefined') {
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
                }};
        } else {
            return options.okButton.apply(this, [$tree, $input, $checkbox, $select]);
        }
    };
};
ChDynatree.prototype._getDefaultValues = function () {
    var defValues = this.defaultValues();
    if (defValues) {
        defValues = defValues.split(this.getSeparator());
    }
    return defValues;
};
ChDynatree.prototype.setData = function ($input, $content) {
    var url = this.getUrl(),
        rawData,
        map = {},
        rootID = this.getRootID();
    if (url) {
        jQuery.ajax({
            type: 'GET',
            url: url,
            async: false,
            success: function (response) {
                var ch_response = new ChResponse(response);
                if (ch_response.isSuccess()) {
                    rawData = ch_response.getData();
                    jQuery.data($input.get(0), "dialog", $content);
                } else {
                    alert('Ошибка при загрузке данных');
                }
            }
        });
    } else {
        rawData = this.getNodes();
    }
    var defaultValues = this._getDefaultValues(), node;

    for (var i in rawData) {
        if (rawData.hasOwnProperty(i)) {
            node = rawData[i];
            node.title = this.getTitleValue(node);
            node.key = this.getKey(node);
            node.desc = node.description;
            if (defaultValues && (defaultValues.length > 1 || this.isSingleMode()) && $.inArray(node.key, defaultValues) !== -1) {
                node.select = true;
                this.defaultsElements.push(node);
            } else {
                node.select = false;
            }
            node.index = i;
            node.icon = false;
            node.parentid = this.getParentID(node);
            node.children = [];
            map[node.key] = node.index;
            this.autoCompleteData.push({label: node.title, id: node.key});
        }
    }

    for (var k in rawData) {
        if (rawData.hasOwnProperty(k)) {
            node = rawData[k];
            if (typeof node.parentid !== 'undefined' && node.parentid !== rootID && node.parentid) {
                rawData[map[node.parentid]].children.push(node);
            } else {
                this.data.push(node);
            }
        }
    }
};
ChDynatree.prototype.dialogEvent = function ($content, $tree, $input, $checkbox, $select) {
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
};
ChDynatree.prototype.checkboxClickEvent = function ($checkbox, $tree) {
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
};
ChDynatree.prototype.autoCompleteEvent = function ($search, $tree, $content) {
    var dynatree = this;
    $search.autocomplete({
        delay: 100,
        source: function (request, response) {
            var search = chApp.getMain().eng2rus(request.term.toLowerCase()),
                prepareResp = dynatree.autoCompleteData.filter(function (item) {
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
};
ChDynatree.prototype.load = function (options) {
    this.init(options);
    var $treeCon = this.$elm.parent(),
        $input = this.getInput(),
        $dialog = jQuery.data($input.get(0), "dialog"),
        is_restore_state = this.isRestoreState(),
        $select = $treeCon.children('select');

    if (typeof $dialog !== 'undefined') {
        var default_values = $input.val().split(this.getSeparator());
        if (!is_restore_state) {
            $input.val('');
            $select.html('');
        }
        $dialog.children('.widget-tree').dynatree("getRoot").visit(function (node) {
            if (is_restore_state && $.inArray(node.data.key, default_values) !== -1) {
                node.select(true);
            } else {
                node.select(false);
            }
        });
        $dialog.dialog("option", "position", {at: "center", collision: "fit", my: "center"});
        $dialog.dialog('open');
    } else {
        var $content = $('<div></div>'),
            $tree = $('<div class="widget-tree"></div>'),
            _this = this,
            $panel;
        //Необходимо инициализировать данные
        this.setData($input, $content);
        this.options.children = this.data;
        if (this.hasInfoPanel()) {
            $panel = $('<div class="widget-panel"></div>');
            this.options.onActivate = function (node) {
                $panel.html(_this.createPanelElement(node.data));
            };

        }
        $tree.dynatree(this.options);
        if (this.isExpandNodes()) {
            $tree.dynatree("getRoot").visit(function (node) {
                node.expand(true);
            });
        }
        var $search = $('<input type="search">'),
            $header = $('<div class="widget-header-tree"></div>'),
            $checkbox = $('<span class="tree-checkbox"><input type="checkbox"><span class="tree-checkbox-caption">Выделить все</span></span>');
        $header.append($search);
        $header.append('<button class="active filter-button menu-button small-button"><span class="fa-eye"></span></button>');
        $content.prepend($header);
        if (this.hasInfoPanel()) {
            $tree.addClass('widget-tree-compact');
            var panelContent = '';
            for (var i in this.defaultsElements) {
                if (this.defaultsElements.hasOwnProperty(i)) {
                    var node = this.defaultsElements[i];
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

        $content.next().prepend($checkbox);
        this.autoCompleteEvent($search, $tree, $content);
        this.checkboxClickEvent($checkbox, $tree);
        return $content;
    }
};
ChDynatree.prototype.createPanelElement = function (node) {
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
};
