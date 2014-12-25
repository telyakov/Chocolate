var chFunctions = {
    textShownFunction: function (e, editable) {
        var $body = editable.$form.find("iframe").contents().find("body");
        $body
            .on("keydown.chocolate", function () {
                $(this).unbind('keydown.chocolate');
                editable.$element.attr('data-change', 1);
            })
            .on('keydown', helpersModule.addSignToIframe);
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
                    //todo: вернуть код
                    //chForm
                    //    .clearChange()
                    //    .refresh();
                }
                chResp.sendMessage(chMsgContainer);
            })
                .fail(function (resp) {
                    chMsgContainer.sendMessage('Возникла непредвиденная ошибка при сохранении вложений.', ChResponseStatus.ERROR);
                });
        }
    },
    layoutChildrenFilters: function (targetID, name, view, currentID, parentName) {
        //todo: вернуть код
        $('#' + targetID).on('click', function (e) {
            var jForm = $(this).closest('form'),
                ChFilterForm = facade.getFactoryModule().makeChFilterForm(jForm),
                rawUrl = optionsModule.getUrl('filterLayouts');
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
    }
};