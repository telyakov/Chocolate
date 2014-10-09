var chFunctions = {
    systemColsInit: function (sysColsID) {
        var $btn = $('#' + sysColsID),
            form = chApp.getFactory().getChGridForm($btn.closest('form'));
        if (!form.ch_form_settings.isSystemVisibleMode()) {
            $btn.addClass(chApp.getOptions().classes.menuButtonSelected);
        }
    },
    textInitFunc: function ($context, e, allowEdit, columnName, caption, isMarkupSupport, $element) {
        (new ChTextColumn($element)).create($context, e, allowEdit, columnName, caption, isMarkupSupport);
    },
    textShownFunction: function (e, editable) {
        var $body = editable.$form.find("iframe").contents().find("body")
        $body
            .on("keydown.chocolate", function () {
                $(this).unbind('keydown.chocolate');
                editable.$element.attr('data-change', 1);
            })
            .on('keydown', ChocolateEvents.addSignToIframeHandler);
    },
    wysiHtmlInit: function ($target, title) {
        $target.editable({
            type: 'wysihtml5',
            wysihtml5: {
                "font-styles": true, //Font styling, e.g. h1, h2, etc. Default true
                "emphasis": true, //Italics, bold, etc. Default true
                "lists": true, //(Un)ordered lists, e.g. Bullets, Numbers. Default true
                "html": false, //Button which allows you to edit the generated HTML. Default false
                "link": false, //Button to insert a link. Default true
                "image": false, //Button to insert an image. Default true,
                "color": true //Button to change color of font
            },
            mode: 'popup',
            onblur: 'ignore',
            savenochange: false,
            title: title
        });
    },
    /**
     * @param chForm {ChGridForm}
     */
    saveAttachment: function (chForm) {
        var delData = chForm.getDeletedObj();
        if (!$.isEmptyObject(delData)) {
            var chMsgContainer = chForm.getMessagesContainer(),
                data = {
                    jsonChangedData: {},
                    jsonDeletedData: JSON.stringify($.extend({}, delData))
                };
            $.ajax({
                type: 'POST',
                url: chForm.getSaveUrl(),
                data: data,
                async: false
            }).done(function (resp) {
                var chResp = new ChResponse(resp);
                if (chResp.isSuccess()) {
                    chForm
                        .clearChange()
                        .refresh();
                }
                chResp.sendMessage(chMsgContainer);
            })
                .fail(function (resp) {
                    chMsgContainer.sendMessage('Возникла непредвиденная ошибка при сохранении вложений.', ChResponseStatus.ERROR);
                })
        }
    },
    _createSubMenu: function (items) {
        var result = ['<ul class="gn-submenu">'], i, sort = [];
        for (i in items) {
            if (items.hasOwnProperty(i)) {
                sort.push({id: i, val: items[i].label})
            }
        }
        sort = sort.sort(function (a, b){
                if(a.val < b.val)
                return -1;
                if(a.val > b.val)
                return 1;
                return 0;
            }
        );
        var _this = this;
        sort.forEach(function(item){
            result.push(_this._createMenuItem(items[item.id]));
        });
        result.push('</ul>');
        return result.join('');

    },
    _createMenuItem: function (item) {
        var menuItemTemplate = '<li><a class="menu-root" href="{*url*}">{*name*}</a>{*submenu*}</li>';
        var subMenuItemTemplate = '<ul><a class="menu-root" href="{*url*}">{*name*}</a>{*submenu*}</ul>';
        var name = item.label, url = item.url;
        if (!Object.keys(item.items).length) {
            return menuItemTemplate.replace('{*url*}', url).replace('{*name*}', name).replace('{*submenu*}', '');
        } else {
            return subMenuItemTemplate.replace('{*url*}', url).replace('{*name*}', name).replace('{*submenu*}', this._createSubMenu(item.items));
        }

    },
    prepareViewName: function(view){
      return view.toLowerCase()  + '.xml';
    },
    createMenu: function (items) {
        var i
            ,tree = {}
            ,subTree = { 0: tree };
        for (i in items) {
            if (items.hasOwnProperty(i)) {
                var row = items[i]
                    ,id = row.id
                    ,label = row.name
                    ,parent = row.parentid
                    ,view = row.viewname
                    ,url;
                if (view) {
                    view = this.prepareViewName(view);
                    if (~view.indexOf('map.xml')) {
                        url = '/map/index?view='+encodeURI(view);
                    }
                    else if ( ~view.indexOf('flatsgramm.xml')){
                        url = '/canvas/index?view='+encodeURI(view);
                    } else {
                        url = '/grid/index?view='+encodeURI(view);
                    }
                } else {
                    url = '#';
                }
                if(!subTree[parent]){
                    subTree[parent] = {};
                }
                var branch = subTree[parent];
                if (parent == 0) {
                    branch[id] = {'label': label, url: '#', items : {}};
                    subTree[id] = branch[id];
                } else {
                    if(!branch.items){
                        branch.items = {};
                    }
                    branch.items[id] = {'label': label, url: url, items: {}};
                    if(url != '#'){
                        branch.items[id].itemOptions = {'class': 'link-form'};
                    }
                    subTree[id] = branch.items[id];
                }
            }
        }
        var $menu = $('#gn-menu'), content = [];
        content.push('<li class="gn-trigger">');
        content.push('<a class="gn-icon gn-icon-menu"></a>');
        content.push('<nav class="gn-menu-wrapper">');
        content.push('<div class="gn-scroller">');
        content.push('<ul class="gn-menu">');
        for (i in tree) {
            if (tree.hasOwnProperty(i)) {
                content.push(this._createMenuItem(tree[i]));
            }
        }
        content.push('</ul>');
        content.push('</div>');
        content.push('</nav>');
        content.push('</li>');
        $menu.html(content.join(''));
        new gnMenu($menu.get(0));
    },
    filterSearchData: function (seacrh, key) {
        return function filter(item, i, arr) {
            return item[key].toLowerCase().indexOf(seacrh) != -1;
        }
    },
    layoutChildrenFilters: function (targetID, name, view, currentID, parentName) {
        $('#' + targetID).on('click', function (e) {
            var jForm = $(this).closest('form'),
                ChFilterForm = ChObjectStorage.create(jForm, 'ChFilterForm'),
                rawUrl = chApp.getOptions().urls.filterLayouts;
            //TODO: поддержка всех типов фильтро
            var value = ChFilterForm.getData()[parentName]
            if (typeof(value) != 'undefined') {
                var url = rawUrl + '?name=' + name + '&view=' + view + '&parentID=' + value;
                $.post(url)
                    .done(function (response) {
                        $('#' + currentID).html(response);
                        jForm.find("[rel=" + name + "]").html('');
                    })
                    .fail(function () {
                        alert('fail');
                    });

            }
        })
    },
    checkBoxInitFunc: function ($context, attribute, allowEdit) {
        var column = chApp.getFactory().getChGridColumnBody($context),
            isAllowEdit = chCardFunction._isAllowEdit(column.getDataObj(), allowEdit);
        $context.unbind('click');
        if (isAllowEdit) {
            $context.on('click', function () {
                var val = $context.editable('getValue');
                if ($.isEmptyObject(val)) {
                    val = 1;
                } else {
                    val = +!val[attribute];
                }
                $context.editable('setValue', val);
                column.setChangedValue(attribute, val);
            })
        } else {
            column.markAsNoChanged();
        }
    },
    treeViewOptions: function ($context, isSingle) {
        var options = {
            children: $context.data().editable.options.source,
            getInput: function () {
                return this
            },
            getTitleValue: function (node) {
                return node.text
            },
            getKey: function (node) {
                return node.id
            },
            getParentID: function (node) {
                return null
            },
            restore_state: true,
            expand_nodes: true,
            defaultValues: function () {
                return this.attr('data-value');
            },
            infoPanel: true,
            separator: '|',
            checkbox: true,
            okButton: function ($tree, $input, $checkbox, $select) {
                var chDynatree = this;
                return  {
                    'text': 'Сохранить',
                    'class': 'wizard-active wizard-next-button',
                    click: function (bt, elem) {
                        var selected_nodes = $tree.dynatree("getSelectedNodes");
                        var val = '', select_html = '';
                        var is_select_all = chDynatree.isSelectAll();
                        for (var i in selected_nodes) {
                            var node = selected_nodes[i];
                            if (is_select_all || node.childList == null) {
                                val += node.data.key;
                                if (!chDynatree.isSingleMode()) {
                                    val += chDynatree.getSeparator();
                                }
                                if (i > 0) {
                                    select_html += '/';
                                }
                                select_html += node.data.title;
                            }
                        }
                        var column = chApp.getFactory().getChGridColumnBody($input);
                        var name = $input.data().editable.options.name;
                        column.setChangedValue(name, val)
                        $input.attr('data-value', val)
                        $input.html(select_html);
                        $checkbox.children('input').attr('checked', false)
                        $(this).dialog("close");
                    }}
            }
        };
        if (isSingle) {
            options.selectMode = 1;
        }
        return options;
    },
    treeViewInitFunc: function ($context, caption, datakey, allowEdit, isSingle) {
        var col = chApp.getFactory().getChGridColumnBody($context);
        if (typeof col.getDataObj() !== 'undefined') {
            $context.html(col.getDataObj()[datakey]);
        }
        $context.unbind('click');
        var isAllowEdit = chCardFunction._isAllowEdit(col.getDataObj(), allowEdit);
        if (isAllowEdit) {
            $context.on('click', function () {
                var chEditable = new ChEditable($context);
                var dynatreeElem = new ChDynatree($context);
                var options = chFunctions.treeViewOptions($context, isSingle);
                options.title = chEditable.getTitle($context.attr('data-pk'), caption);
                dynatreeElem.load(options);
            })
        } else {
            col.markAsNoChanged();
        }

    },
    selectColumnInitFunc: function ($context, allowEdit) {
        var column = chApp.getFactory().getChGridColumnBody($context),
            isAllowEdit = chCardFunction._isAllowEdit(column.getDataObj(), allowEdit);
        if (!isAllowEdit) {
            $context.unbind('click');
            column.markAsNoChanged();
        }
    },
    defaultColumnSaveFunc: function (e, params, name) {
        var chColumn = chApp.getFactory().getChGridColumnBody($(e.target));
        chColumn.setChangedValue(name, params.newValue);
    },
    dateColumnInitFunction: function ($context, allowEdit) {
        var column = chApp.getFactory().getChGridColumnBody($context),
            isAllowEdit = chCardFunction._isAllowEdit(column.getDataObj(), allowEdit);
        if (!isAllowEdit) {
            $context.unbind('click').unbind('mouseenter');
            column.markAsNoChanged();
        }
    },
    dateColumnSaveFunction: function (e, params, name) {
        var chColumn = chApp.getFactory().getChGridColumnBody($(e.target)),
            newVal = params.newValue;
        if (newVal) {
            newVal = moment(newVal).format(ChOptions.settings.formatDate);
        }
        chColumn.setChangedValue(name, newVal);
    },
    treeOnQuerySelect: function (flag, node) {
        if (node.childList == null) {
            return true;
        } else {
            for (var i in node.childList) {
                node.childList[i].select(flag);
            }
        }
        return true
    },
    initPrintActions: function (id, jsonPrintActions) {
        var $actionButton = $('#' + id);
        /**
         *
         * @type {ChGridForm}
         */
        var chForm = ChObjectStorage.create($actionButton.closest('form'), 'ChGridForm'),
            rexExp = new RegExp('\[IdList\]');

        $actionButton.contextmenu({
            show: { effect: "blind", duration: 0 },
            menu: json_parse(jsonPrintActions),
            select: function (event, ui) {
                var url = ui.cmd;
                if (rexExp.test(url)) {
                    var idList = '',
                        rows = chForm.getSelectedRows(),
                        lng = rows.length;
                    for (var i = 0; i < lng; i++) {
                        idList += rows[i].attr('data-id') + ' ';
                    }
                    url = url.replace(/\[IdList\]/g, idList);
                }
                window.open(url);
            }
        })
    },
    initActions: function (id, jsonActions) {
        var $actionButton = $('#' + id);
        /**
         *
         * @type {ChGridForm}
         */
        var chForm = ChObjectStorage.create($actionButton.closest('form'), 'ChGridForm');
        $actionButton.contextmenu({
            show: { effect: "blind", duration: 0 },
            menu: json_parse(jsonActions, Chocolate.parse),
            select: function (event, ui) {
                switch (ui.cmd) {
                    case 'window.print':
                        window.print();
                        break;
                    case 'ch.export2excel':
                        chForm.exportToExcel();
                        break;
                    case 'ch.settings':
                        chForm.openSettings();
                        break;

                }
            }
        });
    },
    initGrid: function (jsonData, jsonPreview, jsonDefault, jsonRequired, jsonGridProperties, formID, header, headerImg, jsonCardCollection, jsonOrder) {
        /**
         * @type {ChGridForm}
         */
        var chForm = ChObjectStorage.create($('#' + formID), 'ChGridForm');
        chForm.saveInStorage(
            json_parse(jsonData, Chocolate.parse),
            json_parse(jsonPreview),
            json_parse(jsonDefault),
            json_parse(jsonRequired),
            json_parse(jsonGridProperties),
            json_parse(jsonOrder)
        );
        chForm.setFmCardsCollection(
            new FmCardsCollection(header, headerImg, json_parse(jsonCardCollection, Chocolate.parse))
        );
    },
    initCardGrid: function (jsonDefault, jsonRequired, jsonGridProperties, formID, header, headerImg, jsonCardCollection, view, parentView, parentID, sql, jsonPreview) {
        /**
         * @type {ChGridForm}
         */
        var chForm = ChObjectStorage.create($('#' + formID), 'ChGridForm');
        chForm.saveInStorage(
            {},
            json_parse(jsonPreview),
            json_parse(jsonDefault),
            json_parse(jsonRequired),
            json_parse(jsonGridProperties),
            []
        );

        chForm.setFmCardsCollection(
            new FmCardsCollection(header, headerImg, json_parse(jsonCardCollection, Chocolate.parse))
        );

//        var url =ChOptions.urls.gridExecute + '?view='+encodeURIComponent(view)
//            + '&parentView='+ encodeURIComponent(parentView)
//            + '&parentID=' + parentID;
        console.log(sql)
        var params = {
            sql: sql,
            view: view,
            parentView: parentView,
            parentID: parentID
        };
        var ajaxTask = new ChAjaxTask(formID, 'ChGridForm', params);
        chAjaxQueue.enqueue(ajaxTask);
    }
}