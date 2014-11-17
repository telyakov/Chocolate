var chFunctions = {
    systemColsInit: function (sysColsID) {
        var $btn = $('#' + sysColsID),
            form = facade.getFactoryModule().makeChGridForm($btn.closest('form'));
        if (!form.chFormSettings.isSystemVisibleMode()) {
            $btn.addClass(chApp.getOptions().classes.menuButtonSelected);
        }
    },
    textInitFunc: function ($context, e, allowEdit, columnName, caption, isMarkupSupport, $element) {
        (new ChTextColumn($element)).create($context, e, allowEdit, columnName, caption, isMarkupSupport);
    },
    textShownFunction: function (e, editable) {
        var $body = editable.$form.find("iframe").contents().find("body");
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
                "color": false //Button to change color of font
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
            for (var property in delData) {
                if (!$.isNumeric(property)) {
                    delete delData[property];
                }
            }

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
                });
        }
    },
    layoutChildrenFilters: function (targetID, name, view, currentID, parentName) {
        $('#' + targetID).on('click', function (e) {
            var jForm = $(this).closest('form'),
                ChFilterForm = facade.getFactoryModule().makeChFilterForm(jForm),
                rawUrl = chApp.getOptions().urls.filterLayouts;
            //TODO: поддержка всех типов фильтро
            var value = ChFilterForm.getData()[parentName];
            if (typeof(value) !== 'undefined') {
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
        var column = facade.getFactoryModule().makeChGridColumnBody($context),
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
            });
        } else {
            column.markAsNoChanged();
        }
    },
    treeViewOptions: function ($context, isSingle) {
        var options = {
            children: $context.data().editable.options.source,
            getInput: function () {
                return this;
            },
            getTitleValue: function (node) {
                return node.text;
            },
            getKey: function (node) {
                return node.id;
            },
            getParentID: function (node) {
                return null;
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
                            if (is_select_all || node.childList === null) {
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
                        var column = facade.getFactoryModule().makeChGridColumnBody($input);
                        var name = $input.data().editable.options.name;
                        column.setChangedValue(name, val);
                        $input.attr('data-value', val);
                        $input.html(select_html);
                        $checkbox.children('input').attr('checked', false);
                        $(this).dialog("close");
                    }};
            }
        };
        if (isSingle) {
            options.selectMode = 1;
        }
        return options;
    },
    treeViewInitFunc: function ($context, caption, datakey, allowEdit, isSingle) {
        var col = facade.getFactoryModule().makeChGridColumnBody($context);
        if (typeof col.getDataObj() !== 'undefined') {
            $context.html(col.getDataObj()[datakey]);
        }
        $context.unbind('click');
        var isAllowEdit = chCardFunction._isAllowEdit(col.getDataObj(), allowEdit);
        //todo: leak memory
        if (isAllowEdit) {
            $context.on('click', function () {
                var chEditable = new ChEditable($context);
                var dynatreeElem = new ChDynatree($context);
                var options = chFunctions.treeViewOptions($context, isSingle);
                options.title = chEditable.getTitle($context.attr('data-pk'), caption);
                dynatreeElem.buildFromData(options);
            });
        } else {
            col.markAsNoChanged();
        }

    },
    selectColumnInitFunc: function ($context, allowEdit) {
        var column = facade.getFactoryModule().makeChGridColumnBody($context),
            isAllowEdit = chCardFunction._isAllowEdit(column.getDataObj(), allowEdit);
        if (!isAllowEdit) {
            $context.unbind('click');
            column.markAsNoChanged();
        }
    },
    defaultColumnSaveFunc: function (e, params, name) {
        var chColumn = facade.getFactoryModule().makeChGridColumnBody($(e.target));
        chColumn.setChangedValue(name, params.newValue);
    },
    dateColumnInitFunction: function ($context, allowEdit) {
        var column = facade.getFactoryModule().makeChGridColumnBody($context),
            isAllowEdit = chCardFunction._isAllowEdit(column.getDataObj(), allowEdit);
        if (!isAllowEdit) {
            $context.unbind('click').unbind('mouseenter');
            column.markAsNoChanged();
        }
    },
    dateColumnSaveFunction: function (e, params, name) {
        var chColumn = facade.getFactoryModule().makeChGridColumnBody($(e.target)),
            newVal = params.newValue;
        if (newVal) {
            newVal = moment(newVal).format(ChOptions.settings.formatDate);
        }
        chColumn.setChangedValue(name, newVal);
    },
    treeOnQuerySelect: function (flag, node) {
        if (node.childList === null) {
            return true;
        } else {
            for (var i in node.childList) {
                if(node.childList.hasOwnProperty(i)){

                    node.childList[i].select(flag);
                }
            }
        }
        return true;
    },
    initPrintActions: function (id, jsonPrintActions) {
        var $actionButton = $('#' + id);
        /**
         *
         * @type {ChGridForm}
         */
        var chForm =facade.getFactoryModule().makeChGridForm($actionButton.closest('form')),
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
        });
    },
    initActions: function (id, jsonActions) {
        var $actionButton = $('#' + id);
        var chForm = facade.getFactoryModule().makeChGridForm($actionButton.closest('form'));
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
        var form = facade.getFactoryModule().makeChGridForm($('#' + formID));
        form.saveInStorage(
            json_parse(jsonData, Chocolate.parse),
            json_parse(jsonPreview),
            json_parse(jsonDefault),
            json_parse(jsonRequired),
            json_parse(jsonGridProperties),
            json_parse(jsonOrder)
        );
        form.setFmCardsCollection(
            new FmCardsCollection(header, headerImg, json_parse(jsonCardCollection, Chocolate.parse))
        );
    },
    initCardGrid: function (jsonDefault, jsonRequired, jsonGridProperties, formID, header, headerImg, jsonCardCollection, view, parentView, parentID, sql, jsonPreview) {

        var chForm = facade.getFactoryModule().makeChGridForm($('#' + formID));
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
        var params = {
            sql: sql,
            view: view,
            parentView: parentView,
            parentID: parentID
        };
        var optionsModule = facade.getOptionsModule();
        mediator.publish(optionsModule.getChannel('socketRequest'), {
            query: sql,
            type: optionsModule.getRequestType('chFormRefresh'),
            id: formID
        });
    }
};