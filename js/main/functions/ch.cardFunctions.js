var ch ={
    card:{
        treeView: {
            _okButton: function(){
                return function( $tree, $input, $checkbox, $select){
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
                                    if(!chDynatree.isSingleMode()){
                                        val += chDynatree.getSeparator();
                                    }
                                    if(i>0){
                                        select_html += '/';
                                    }
                                    select_html += node.data.title;
                                }
                            }
                            $input.editable('setValue', val);
                            var chCardElement = ChObjectStorage.getChCardElement($input);
                            var name =$input.data().editable.options.name;
                            $input.html(select_html)

                            chCardElement
                                .setChangedValue(name, val)
                                .setChangedValueInGrid(name, val, select_html);
                            chCardElement.getParentElement(name).html(select_html)
                            $(this).dialog("close");
//                            $input.focus();
                        }}
                }
            },
            defaultInit: function($context, attribute, allowEdit, titleKey, editable, caption, isSingle){
                var cardElement = ChObjectStorage.getChCardElement($context),
                    card = cardElement.getCard(),
                    actualDataObj = card.getActualDataObj(),
                    value = actualDataObj[attribute],
                    isAllowEdit = chCardFunction._isAllowEdit(card.getActualDataObj(), allowEdit);
                if (typeof(value) == 'undefined' || value === null) {
                    value = '';
                }
                var elemText = cardElement.getParentElement(attribute).html();
                ChCardInitCallback.add(function () {
                    card.setElementValue($context, value, isAllowEdit, elemText);
                    $context.html(elemText);
                        $context.unbind('click');
                    if(isAllowEdit){
                        $context.on('click', function(){
                            var dynatreeElem = new ChDynatree($context);
                            var options = chFunctions.treeViewOptions($context, isSingle);
                            options.okButton = ch.card.treeView._okButton();
                            options.defaultValues = function(){return this.data().editable.value}
                            dynatreeElem.load(options);
                        })
                    }
                });
            },
            gridInit: function($context, attribute, allowEdit, titleKey, editable, caption, isSingle){
                var cardElement = ChObjectStorage.getChCardElement($context),
                    card = cardElement.getCard(),
                    actualDataObj = card.getActualDataObj(),
                    value = actualDataObj[attribute],
                    isAllowEdit = chCardFunction._isAllowEdit(card.getActualDataObj(), allowEdit);
                if (typeof(value) == 'undefined' || value === null) {
                    value = '';
                }
                var elemText = cardElement.getParentElement(attribute).html();
                ChCardInitCallback.add(function () {
                    card.setElementValue($context, value, isAllowEdit, elemText);
                    $context.html(elemText);
                    $context.unbind('click');
                    if(isAllowEdit){
                        $context.on('click', function(){
                            var chEditable = new ChEditable($context),
                                dynatreeElem = new ChDynatree($context),
                                options = chFunctions.treeViewOptions($context, isSingle);
                            options.children =  cardElement.getParentElement(attribute).data().editable.options.source;
                            options.okButton = ch.card.treeView._okButton();
                            options.title = chEditable.getTitle($context.attr('data-pk'), caption);
                            options.defaultValues = function(){return this.data().editable.value}
                            dynatreeElem.load(options);
                        })
                    }else{
                        cardElement.markAsNoChanged();
                    }
                });
            },
            dynamicInit: function($context, attribute, allowEdit, titleKey, editable, caption, isSingle, sql){
                var cardElement = ChObjectStorage.getChCardElement($context),
                    card = cardElement.getCard(),
                    actualDataObj = card.getActualDataObj(),
                    value = actualDataObj[attribute],
                    isAllowEdit = chCardFunction._isAllowEdit(card.getActualDataObj(), allowEdit);
                if (typeof(value) == 'undefined' || value === null) {
                    value = '';
                }
                var elemText = actualDataObj[titleKey];
                ChCardInitCallback.add(function () {
                    card.setElementValue($context, value, isAllowEdit, elemText);
                    $context.html(elemText);
                    $context.unbind('click');
                    if(isAllowEdit){
                        sql = chApp.getBindService().fromData(sql, cardElement.getCard().getActualDataObj());
                        var url = chApp.getOptions().urls.execute +'?cache=1&view=' +cardElement.getCard().getView() + '&sql=' + sql;
                        $context.on('click', function(){
                            var chEditable = new ChEditable($context),
                                dynatreeElem = new ChDynatree($context),
                                options = chFunctions.treeViewOptions($context, isSingle);
                            options.children =  null;
                            options.url = url;
                            options.getTitleValue= function (node) {return node.name};
                            options.okButton = ch.card.treeView._okButton();
                            options.title = chEditable.getTitle($context.attr('data-pk'), caption);
                            options.defaultValues = function(){return this.data().editable.value}
                            dynatreeElem.load(options);
                        })
                    }else{
                        cardElement.markAsNoChanged();
                    }
                });
            }
        }
    },
    attachments: {
        initData: function(id, isNewRow){
            $(function(){
                var factory = chApp.namespace('factory'),
                    main = chApp.namespace('main');
                var chTable = factory.getChTable($(main.idSel(id)).find('table'));
                chTable.initAttachmentScript();
                if(!isNewRow){
                    chTable.ch_form.refresh();
                }
            });
        },
        initScript: function(sectionID, formID, isNewRow, jsonDefaultValues ) {
            $(function () {
                var $section = $('#' + sectionID),
                    $cnt = $section.parent();
                if (!$cnt.hasClass('card-grid')) {
                    chApp.getDraw().drawGrid($cnt);
                }
                if (!isNewRow) {
                    $section
                        .on('drop', function (e) {
                            $(this).removeClass("attachment-dragover");
                            e.preventDefault();
                        })
                        .on('dragover', function (e) {
                            $(this).addClass("attachment-dragover");
                            e.preventDefault();
                        })
                        .on('dragleave', function () {
                            $(this).removeClass("attachment-dragover")
                        });
                }
                var $form = $('#' + formID),
                    form = chApp.getFactory().getChGridForm($form);
                $form.on('fileuploadsubmit', function () {
                    return false;
                });
                var defaultValues = $.parseJSON(jsonDefaultValues);
                form.saveInStorage({}, {}, defaultValues, {}, {});
            });
        },
        stopHandler: function(formID){
            var filesModule = chApp.getFiles(),
                form = chApp.getFactory().getChGridForm($('#' + formID));
            if(filesModule.hasErrors(formID)){
                form.getMessagesContainer().sendMessage('Возникли ошибки при добавлении вложений', chApp.getResponseStatuses().ERROR);
                filesModule.clearErrors(formID);
            }else{
                if(form.isHasChange()){
                    form.save();
                }else{
                    form.refresh();
                }
            }
        },
        failHandler: function(formID, data){
            var filesModule = chApp.getFiles();
            filesModule.pushError(formID, data.errorThrown);
            filesModule.push(formID, data.files);
        },
        addedHandler: function(formID, data){
            var $form = $('#' + formID),
                form = chApp.getFactory().getChGridForm($form);
            if(data.isValidated){
                var rowID = Chocolate.uniqueID();
                data.files[0].rowID = rowID;
                chApp.getFiles().push(formID,data.files);
                data.context.attr("data-id", rowID);
                data.context.find("td input[type=file]").attr("parent-id", rowID);
                $form.find("div[data-id=user-grid] table").trigger("update");
                form.getSaveButton().addClass("active");
            }else{
                data.context.remove();
                form.getMessagesContainer().sendMessage("Слишком большой размер файла (максисмум 50мб.)", chApp.getResponseStatuses().ERROR);
            }
        }
    }
};
var chCardFunction = {
    defaultValidateFunc: function ($context, value) {
        var $error = $context.closest(".card-col").children("label");
        if ($.trim(value) == "") {
            $error.addClass("card-error");
        } else {
            $error.removeClass("card-error");
        }
    },
    select2ColumnSaveFunction: function (e, params, name) {
        var jCell = $(e.target),
            chColumn = new ChGridColumnBody(jCell);
        if (params.newValue.length > 0 && params.newValue[0].indexOf(",") != -1) {
            //отсекаем первый элемент, тк это какой- то левак
            delete params.newValue[0];
        }
        var new_value = chCardFunction._select2PrepareNewValue(params.newValue);
        jCell.editable("setValue", params.newValue);
        chColumn.setChangedValue(name, new_value);
    },
    _select2PrepareNewValue: function(rawValue){
        var result = "";
        if(typeof rawValue =='string'){
            result = rawValue;
        }else{
            for (var i in rawValue) {
                result += rawValue[i] + "|";
            }
        }
        return result;
    },
    select2ColumnInitFunction: function (element, callback) {
        var data = [],
            sql_data = element.data().select2.opts.data;
        $(element.val().split(",")).each(function (i) {
            if (this != "") {
                var option_name = '', desc = '';
                for (var i in sql_data) {
                    var el = sql_data[i];
                    if (el.id == this) {
                        option_name = el.text;
                        desc = el.desc;
                        data.push({id: this, text: option_name, desc: desc });

                        break;
                    }
                }
            }
        });

        callback(data);
    },
    defaultSaveFunc: function (e, params, name) {
        var $target = $(e.target);
        /**
         *
         * @type {ChCardElement}
         */
        ChObjectStorage.create($target, 'ChCardElement')
            .setChangedValue(name, params.newValue)
            .setChangedValueInGrid(name, params.newValue, $target.text());
    },
    dateSaveFunc: function (e, params, name) {
        var $target = $(e.target);
        /**
         *
         * @type {ChCardElement}
         */
        var dtValue = moment(params.newValue).format(ChOptions.settings.formatDate);
        ChObjectStorage.create($target, 'ChCardElement')
            .setChangedValue(name, dtValue)
            .setChangedValueInGrid(name, params.newValue);
    },
    textAreaInitFunc: function (e, editable, attribute, allowEdit, caption, isNeedFormat, context, isMarkupSupport) {
        var jCell = $(context);

        /**
         *
         * @type {ChCardElement}
         */
        var chCardElement = ChObjectStorage.create(jCell, 'ChCardElement'),
            chCard = chCardElement.getCard(),
            value = chCard.getActualDataObj()[attribute];
        var isAllowEdit = this._isAllowEdit(chCard.getActualDataObj(), allowEdit);
        if (isNeedFormat && value) {
            value = Chocolate.formatNumber(value);
        }
        if(!isAllowEdit){
            chCardElement.markAsNoChanged();

        }
        if (value === null) {
            value = '';
        }
        ChCardInitCallback.add(function () {
            chCard.setElementValue(jCell, value, isAllowEdit);
            var ch_column = new ChTextAreaEditableCard(editable['$element']);
            ch_column.create(context, e, isAllowEdit, attribute, caption, isNeedFormat, isMarkupSupport);
        });
    },
    checkBoxDisplayFunction: function (value, $context, label, color, priority) {
            var chForm;
        if($context.closest('tr').length && color && priority){
            chForm = ChObjectStorage.create($context.closest('form'), 'ChGridForm');
        }
        if (typeof(value) != 'undefined' && parseInt(value, 10)) {
               if(chForm){
                   chForm.addPriorityColorAndApply($context.attr('data-pk'),priority, color)
               }
            if(label == ChOptions.labels.attention){
                $context.html('<span class="fa-exclamation"></span>');
            }else if(label == ChOptions.labels.notView){
                $context.html('<span class="fa-question"></span>');
            }
            else{
                $context.html('<span class="fa-check"></span>');
            }
        } else {
            if(chForm){
                chForm.removePriorityColorAndApply($context.attr('data-pk'),priority)
            }
            $context.html('');
        }
    },
    checkBoxInitFunction: function ($context, attribute, allowEdit) {
        var cardElement = chApp.namespace('factory').getChCardElement($context),
            card = cardElement.getCard(),
            value = card.getActualDataObj()[attribute],
            isAllowEdit = this._isAllowEdit(card.getActualDataObj(), allowEdit);
        $context.unbind('click');
        if (isAllowEdit) {
            $context.on('click', function () {
                var val = $context.editable('getValue');
                if ($.isEmptyObject(val)) {
                    val = 1;
                } else {
                    val = +!parseInt(val[attribute], 10);
                }
                $context.editable('setValue', val);
                cardElement
                    .setChangedValue(attribute, val)
                    .setChangedValueInGrid(attribute, val, $context.text());
            })
        }else{
            cardElement.markAsNoChanged();
        }
        ChCardInitCallback.add(function () {
            card.setElementValue($context, value, isAllowEdit);
        });
    },
    dateInitFunction: function ($context, attribute, allowEdit) {

        /**
         *
         * @type {ChCardElement}
         */
        var chCardElement = ChObjectStorage.create($context, 'ChCardElement');
        var chCard = chCardElement.getCard(),
            value = chCard.getActualDataObj()[attribute],
            dtValue;
        var isAllowEdit = this._isAllowEdit(chCard.getActualDataObj(), allowEdit)

        if (value && typeof(value) == 'string') {
            value = value.replace(/\./g, '/')
            dtValue = new Date(value);
        } else {
            dtValue = value;
        }
        if(!isAllowEdit){
            chCardElement.markAsNoChanged();
        }
        ChCardInitCallback.add(function () {
            chCard.setElementValue($context, dtValue, isAllowEdit);
        })

    },
    select2SaveFunction: function (e, params, attribute) {

        var $context = $(e.target);
        /**
         * @type {ChCardElement}
         */
        var chCardElement = ChObjectStorage.create($context, 'ChCardElement');

        var new_value = chCardFunction._select2PrepareNewValue(params.newValue);
        $context.editable('setValue', new_value);

        chCardElement
            .setChangedValue(attribute, new_value)
            .setChangedValueInGrid(attribute, params.newValue, $context.text());
    },
    select2GetParentDataSource: function (element, name) {
        var chCardElement = ChObjectStorage.create(element, "ChCardElement");
        return chCardElement.getParentElement(name).data().editable.options.source;
    },
    select2GetDataSource: function (formID, pk, name) {
        return $('#' + formID).find("a[data-pk=" + pk + "][rel$=" + name + "]").data().editable.options.source;
    },
    select2InitSelectionFunction: function (element, callback, name) {
        var parentData = chCardFunction.select2GetParentDataSource(element, name);
        var data = [];
        $(element.val().split(",")).each(function () {
            var id = this;
            if (id.length) {
                var text = "", desc ='';
                $(parentData).each(function () {
                    if (this.id == id) {
                        text = this.text;
                        desc = this.desc;
                        data.push({id: id, text: text, desc: desc});

                        return false;
                    }
                });
            }
        });
        callback(data);
    },
    select2ShownFunction: function (editable) {
        if (typeof(editable) != "undefined") {
            editable.formOptions.input.postrender = function () {
                editable.$form.find(".select2-search-field input").focus()
            }
        }
    },
//    select2SortFunction: function (results, container, query) {
//        if (term != "") {
//            var term = query.term.toLowerCase();
//            results = results.sort(function (a, b) {
//                if (a.text.toLowerCase().indexOf(term) == 0) {
//                    return -1;
//                }
//                if (b.text.toLowerCase().indexOf(term) == 0) {
//                    return 1
//                }
//                return 0;
//            })
//        }
//        return results;
//    },
    select2InitFunction: function ($context, attribute, allowEdit, titleKey, editable, caption) {

        /**
         *
         * @type {ChCardElement}
         */
        var chCardElement = ChObjectStorage.create($context, 'ChCardElement');
        var chCard = chCardElement.getCard(),
            actualDataObj = chCard.getActualDataObj(),
            value = actualDataObj[attribute];
        var isAllowEdit = this._isAllowEdit(chCard.getActualDataObj(), allowEdit)
        if (typeof(value) == 'undefined' || value === null) {
            value = '';
        }
        var html = chCardElement.getParentElement(attribute).html();
        var prepareValue = value.split('|');
        ChCardInitCallback.add(function () {
            chCard.setElementValue($context, prepareValue, isAllowEdit, html);
            var chEditable = new ChEditable($context);
            $context.attr('data-original-title', chEditable.getTitle($context.attr('data-pk'), caption));
        });
    },
    _isAllowEdit: function(dataObj, allowEdit){
        var isAllowEdit = false,
            allowEditLC = allowEdit.toLowerCase();
        if (allowEditLC.indexOf('|') != -1 || allowEditLC.indexOf('editable') != -1 || allowEditLC.indexOf('role') != -1) {
            var tokens = allowEditLC.split('|');
            tokens.forEach(function (token) {
                if (!isAllowEdit) {
                    var parts = token.split('='),
                        type = parts[0],
                        value = parts[1];
                    switch (type) {
                        case 'editable':
                            if(typeof(dataObj)!='undefined' && dataObj['editable'] == value){
                                isAllowEdit = true;
                            }
                            break;
                        case 'role':
                            if(Chocolate.user.hasRole(value.toLowerCase())){
                                isAllowEdit = true;
                            }
                            break;

                    }
                }
            })
        } else {

            switch (allowEditLC) {
                case 'true':
                    isAllowEdit = true;
                    break;
                case 'false':
                    isAllowEdit = false;
                    break;
                case '1':
                    isAllowEdit = true;

            }
        }
        return isAllowEdit;
    },

    selectInitFunction: function ($context, attribute, allowEdit) {


        /**
         *
         * @type {ChCardElement}
         */
        var chCardElement = ChObjectStorage.create($context, 'ChCardElement');
        var chCard = chCardElement.getCard(),
            value = chCard.getActualDataObj()[attribute];
        var isAllowEdit = this._isAllowEdit(chCard.getActualDataObj(), allowEdit)
        if(!isAllowEdit){
            $context.unbind('click')
            chCardElement.markAsNoChanged();

        }

        ChCardInitCallback.add(function () {
            chCard.setElementValue($context, value, isAllowEdit);
        });
    },
    multimediaInitFunction: function (pk, sql, formID, id) {
        var form = chApp.getFactory().getChGridForm($('#' + formID));
        sql = chApp.getBindService().fromParentData(sql, form.getDataObj()[pk]);
        $.get(chApp.getOptions().urls.imagesUrls, {sql: sql})
            .done(function (response) {
                var res = new ChResponse(response),
                 data = res.getData();
                if(data.length){
                    var $context = $('#' + id), imagesHtml = '',
                        isFirst = true;
                    data.forEach(function(url){
                        if (isFirst) {
                            imagesHtml += '<a class="fancybox multimedia-main-image" rel="gallery"><img src="' + url + '"></img></a>';
                            isFirst = false;
                        } else {
                            imagesHtml += '<a class="fancybox multimedia-image" rel="gallery" style="display:none"><img src="' + url + '"></img></a>';
                        }
                    });
                    $context.append(imagesHtml);
                    $context.find('.fancybox').fancybox({
                        live: false,
                        maxWidth: 800,
                        maxHeight: 600,
                        closeClick: false,
                        openEffect: 'none',
                        closeEffect: 'none'
                    });
                }
            })
            //TODO: обработчик ошибки при получении данных
            .fail(function () {
            })

    }
}