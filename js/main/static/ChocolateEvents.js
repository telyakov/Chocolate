var ChocolateEvents = {
    KEY: {
        ENTER: 13,
        BACKSPACE: 8,
        F4: 115,
        F5: 116,
        UP: 38,
        DOWN: 40,
        DEL: 46,
        ESCAPE: 27
    },
    createEventsHandlers: function () {
        var main = chApp.namespace('main'),
            $content = main.$content,
            $window = main.$window,
            $tabs = main.$tabs,
            $footer = main.$footer,
            $header = main.$header,
            $body = $('body');
        this.ajaxIndicatorEvent();
        this.closeTabEvent($content);
        this.menuContextEvent($tabs);
        this.openCardEvent($tabs);
        this.keyActionsFormEvent($tabs);
        this.selectFormRowEvent($tabs);
        this.contextFormMenuEvent($tabs);
        this.cardCancelEvent($tabs);
        this.addRowToForm($tabs);
        this.saveFormEvent($tabs);
        this.refreshFormEvent($tabs);
        this.cardSaveEvent($tabs);
        this.reflowTabEvent($tabs);
        this.tabHistoryLogEvent($content);
        this.reflowWindowEvent($window);
        this.openTaskWizardEvent($content);
        this.signInTextEvents($content);
        this.disableFiltersEvent($content);
        this.searchInFilterEvent($content);
        this.openFormEvent($footer, $body);
        this.downloadAttachmentEvent($content);
        this.toggleSystemColsEvent($tabs);
        this.warningMessageEvent($window);
        this.formMenuButtonEvent($tabs);
        this.makeCallEvent($body);
        this.preventDefaultBrowserEvents($window);
        this.openChildGridEvent($tabs);
        this.keyActionsCardEvent($tabs);
        this.deselectTreeElementEvent($body);
        this.modalFormElementEvent($content);
    },
    tabHistoryLogEvent: function($context){
        $context.on('click', '#tabs>ul>li', this.tabHistoryLogHandler);
    },
    tabHistoryLogHandler: function(){
        ChTabHistory.push($(this));
    },
    modalFormElementEvent: function ($context) {
        $context.on('click', '.form-modal-button', this.modalFormElementHandler);
    },
    modalFormElementHandler: function () {
        var $this = $(this),
            isEdit = parseInt($this.attr('data-edit'), 10),
            name = $this.attr('data-name'),
            caption = $this.attr('data-caption'),
            isMarkupSupport = parseInt($this.attr('data-markup'), 10),
            $elem = $(this).prevAll('a'),
            $cell = $elem.parent(),
            column = chApp.getFactory().getChGridColumnBody($elem),
            $popupControl = $('<a class="grid-textarea"></a>');
        Chocolate.leaveFocus();
        $popupControl.appendTo($cell.closest('section'));
        if (isMarkupSupport) {
            chFunctions.wysiHtmlInit($popupControl, ChEditable.getTitle(column.getID(), caption));
        } else {
            $popupControl.editable({type: 'textarea', mode: 'popup', onblur: 'ignore', savenochange: false, title: ChEditable.getTitle(column.getID(), caption)});
        }
        $popupControl
            .bind('save', {
                isEdit: isEdit,
                $popup: $popupControl,
                $elem: $elem,
                column: column,
                name: name
            },
            ChTextColumn.SaveHandler
        )
            .bind('hide', function () {
                $(this).remove();
            });

        var value = $elem.editable('getValue')[name];
        if (typeof value !== 'string') {
            value = value.toString();
        }
        if (isMarkupSupport) {
            value = value.replace(/\r\n|\r|\n/g, '<br>');
        }
        $popupControl
            .editable('setValue', value)
            .editable('show');
        var $textArea = $popupControl.next('div').find('textarea');
        if (!isEdit) {
            $textArea.attr('readonly', true);
        } else if (isMarkupSupport) {
            var editor = new wysihtml5.Editor($textArea.get(0)), eventData = {};
            if (name == 'commentforreport') {
                if (Chocolate.user.getName() == 'Игнатьев Дмитрий Иванович'){
                    eventData = {editor: $textArea.data("wysihtml5").editor, red:true};
                }else{
                    eventData = {editor: $textArea.data("wysihtml5").editor, red:false};

                }
            }
            editor.on('load', function () {
                $textArea.siblings('iframe').eq(1).contents().find('body')
                    .on('keydown', eventData, ChocolateEvents.addSignToIframeHandler)
                    .on('keydown', function (e) {
                        var keys = chApp.namespace('events.KEY');
                        if (e.keyCode == keys.ESCAPE) {
                            $popupControl.editable('hide');
                        }
                    })
            });
        }
        return false;
    },
    deselectTreeElementEvent: function ($context) {
        $context.on('click', '.widget-elem-close', this.deselectTreeElementHandler);
    },
    deselectTreeElementHandler: function () {
        var $panelElem = $(this).closest('.widget-panel-elm'),
            key = $panelElem.attr('data-key'),
            tree = $panelElem.closest('.widget-panel').prev('.widget-tree-compact').dynatree("getTree");
        tree.selectKey(key, false);
        $panelElem.remove();
    },
    keyActionsCardEvent: function ($context) {
        $context.on('keydown', '.card-input a', this.keyActionsCardHandler)
    },
    /**
     *
     * @param e {Event}
     * @returns {boolean|undefined}
     */
    keyActionsCardHandler: function (e) {
        var keys = chApp.namespace('events.KEY');
        if (e.keyCode === keys.ENTER) {
            var $this = $(this), $modalBtn = $this.next('.grid-modal-open');
            if ($modalBtn.length) {
                $modalBtn.triggerHandler('click');
            } else {
                $(this).triggerHandler('click');
            }
            return false;
        }
    },
    openChildGridEvent: function ($context) {
        $context.on('click', '.grid-button', this.openChildGridHandler);
    },
    openChildGridHandler: function () {
        var main = chApp.namespace('main'),
            $editable = $(this).find('.editable'),
            options = $editable.data().editable.options,
            view = options.view,
            factory =  chApp.getFactory(),
            column = factory.getChGridColumnBody($editable),
            form = column.getChForm(),
            parentID = column.getID(),
            isNew = !$.isNumeric(parentID),
            parentView = form.getView(),
            tabID = ChGridColumn.createChildGridTabID(parentID, view, parentView),
            $tabs = main.$tabs,
            template = form.getFmChildGridCollection().getCardTemplate(view, parentView, isNew),
            $currentTab = $tabs.find("[aria-controls='" + tabID + "']"),
            toID = options.toID,
            toName =options.toName,
            fromID = options.fromID,
            fromName = options.fromName,
            isSelect = '';
            if(toID && toName && fromName && fromID){
                isSelect = 1;
            }
        if ($currentTab.length) {
            $tabs.tabs("select", tabID)
        } else {
            var caption = [options.title, ' [', parentID, ']'].join('');
            main.tab.addAndSetActive(tabID, caption);
            if (template === null) {
                var urls = chApp.getOptions().urls;
                $.get(urls.childGrid, {
                    view: view,
                    jsonFilters: JSON.stringify({filters: {ParentID: parentID}}),
                    ParentView: parentView,
                    parentViewID: form.getID(),
                    isSelect: isSelect
                })
                    .done(function (res) {
                        var response = new ChGridResponse(res);
                        if (response.isSuccess()) {
                            var template = response.getData(),
                                $html = main.layoutTemplate(template, parentID);
                            try {
                                $('<div></div>')
                                    .attr('id', tabID)
                                    .appendTo($tabs)
                                    .html($html);
                                    $('#'+ tabID).find('.grid-select').on('click', function(){
                                            var form = factory.getChGridForm($(this).closest('.grid-footer').prev('form'));
                                            if(form.isHasChange()){
                                                form.getMessagesContainer().sendMessage('Сохраните сетку, перед выбором!', ChResponseStatus.ERROR);
                                            }else{
                                                var selectedRows = form.getSelectedRows();
                                                if(selectedRows.length !=1){
                                                    form.getMessagesContainer().sendMessage('Выберите одну строчку', ChResponseStatus.ERROR);
                                                }else{
                                                    //todo: реализовать алгоритм биндинга
//                                                    var rowID = factory.getSelectedRows[0].attr('data-id');
//                                                    var data =  form.getDataObj()[rowID];
//                                                    var $tr = $editable.closest('tr');
//                                                    factory.getChGridColumnBody()
//                                                    column.setChangedValue(toID, data[fromID]);
//                                                    editable.html(data[fromName])
                                                }
                                            }
                                        }
                                    );
                                $tabs.tabs("refresh");
                                form.getFmChildGridCollection().setCardTemplate(view, parentView, template, isNew);
                            } catch (er) {
                                main.log.error('Возникла ошибка при вставке html+ js дочерней сетке в DOM', er);
                                $html.remove();
                            }
                        } else {
                            main.log.error(response.getStatusMsg);
                        }
                    })
                    .fail(function (er) {
                        main.log.error('Возникла ошибка при открытии дочерней карточки', er)
                    });
            } else {
                $('<div></div>')
                    .attr('id', tabID)
                    .appendTo($tabs)
                    .html(main.layoutTemplate(template, parentID));
            }
        }
        return false;
    },
    makeCallEvent: function ($context) {
        $context.on('click', '.fm-phone', this.makeCallHandler);
    },
    makeCallHandler: function () {
        var urls = chApp.namespace('options.urls'),
            main = chApp.namespace('main'),
            phoneTo = $(this).attr('data-phone');
        $.get(urls.makeCall, {phoneTo: phoneTo})
            .done(function (res) {
                var response = new ChResponse(res);
                if (response.hasError()) {
                    main.log.error(response.getStatusMsg())
                }
            })
            .fail(function (er) {
                main.log.error(er)
            })

    },
    formMenuButtonEvent: function ($context) {
        $context
            .on('click', '.menu-button-excel', this.exportToExcelHandler)
            .on('click', '.menu-button-settings', this.openFormSettingHandler);
    },
    /**
     * #tips2
     */
    exportToExcelHandler: function () {
        var factory = chApp.namespace('factory'),
            form = factory.getChGridForm($(this).closest('form'));
        form.exportToExcel();
    },
    openFormSettingHandler: function () {
        var factory = chApp.namespace('factory'),
            form = factory.getChGridForm($(this).closest('form'));
        form.openSettings();
    },
    warningMessageEvent: function ($context) {
        $context.on('beforeunload', this.warningMessageHandler);
    },
    /**
     * @returns {string|undefined}
     */
    warningMessageHandler: function () {
        var main = chApp.namespace('main');
        if (main.hasChange()) {
            var messages = chApp.namespace('options.messages')[main.locale];
            return messages.chocolateHasChange;
        }
    },
    toggleSystemColsEvent: function ($context) {
        $context.on('click', '.menu-button-toggle', this.toggleSystemColsHandler);
    },
    toggleSystemColsHandler: function () {
        var factory = chApp.namespace('factory');
        factory.getChGridForm($(this).closest('form'))
            .toggleSystemCols()
            .clearSelectedArea();
    },
    downloadAttachmentEvent: function ($context) {
        $context
            .on('click', '.attachment-file', function () {
                return false;
            })
            .on('click', '.attachment-file', $.debounce(2000, true, this.downloadFileHandler));
    },
    /**
     * #tips 2
     * @returns {boolean}
     */
    downloadFileHandler: function () {
        $.fileDownload($(this).attr('href'));
        return false;
    },
    openFormEvent: function ($footer, $content) {

        $footer.on('click', '.link-form > a, .link-profile', this.openFormHandler);
        $content.on('click', '.menu-root', function(){
            var $this = $(this), $submenu = $this.siblings('.gn-submenu');
            if($submenu.length){
                $submenu.toggle();
            }else{
                var main = chApp.namespace('main');
                main.openForm($(this).attr('href'));
                $this
                    .closest('.gn-menu-wrapper')
                    .removeClass('gn-open-all')
                    .prev('.gn-icon-menu')
                    .removeClass('gn-selected');
            }
            return false;

        });
    },
    /**
     * #tips 2
     * @params e {Event}
     */
    openFormHandler: function (e) {
        var main = chApp.namespace('main');
        main.openForm($(this).attr('href'));
        e.preventDefault();
    },
    searchInFilterEvent: function ($context) {
        $context.on('keydown', 'input[type=search].filter', this.searchInFilterHandler);
    },
    /**
     * #tips 2
     * @param e {Event}
     * @return {boolean|undefined}
     */
    searchInFilterHandler: function (e) {
        var keys = chApp.namespace('events.KEY');
        if (e.keyCode == keys.ENTER) {
            var factory = chApp.namespace('factory'),
                form = factory.getChGridForm($(this).closest('.section-filters').next('.section-grid').children('form'));
            form.refresh();
            return false;
        }
    },
    reflowWindowEvent: function ($context) {
        $context.on('resize', $.debounce(300, false, this.reflowWindowHandler));
    },
    reflowWindowHandler: function () {
        var draw = chApp.namespace('draw');
        draw.clearReflowedTabs();
        draw.reflowActiveTab();
    },
    reflowTabEvent: function ($context) {
        $context.on('click', '.ui-tabs-anchor', chApp.namespace('draw.reflowActiveTab'));
    },
    ajaxIndicatorEvent: function () {
        var $spinner = $('#fadingBarsG');
        $(document)
            .ajaxStart(function () {
                if (!$spinner.is(':visible')) {
                    $spinner.show();
                }
            })
            .ajaxStop(function () {
                $spinner.hide();
            });
    },
    closeTabEvent: function ($context) {
        $context
            .on('click', '.tab-closed', this.closeTabHandler)
            .on('touchmove', '#tabs>ul>li>a', this.closeTabHandler);
    },
    closeTabHandler: function () {
        var tab = chApp.namespace('main.tab');
        tab.close($(this));
        return false;
    },
    menuContextEvent: function ($context) {
        $context.on('click ', '.menu-button-print, .menu-button-action', this.menuContextHandler)
    },
    menuContextHandler: function () {
        var $this = $(this);
        $this.contextmenu('open', $this);
    },
    openCardEvent: function ($context) {
        $context.on('touchmove dblclick', '.card-button', this.openCardHandler);
    },
    openCardHandler: function () {
        var factory = chApp.namespace('factory'),
            $cell = $(this),
            form = factory.getChGridForm($cell.closest('form')),
            column = chApp.getFactory().getChGridColumnBody($cell);
        form.openCard(column.getID());
    },
    keyActionsFormEvent: function ($context) {
        $context.on('keydown', '.tablesorter', this.keyActionsFormHandler);
    },
    keyActionsFormHandler: function (e) {
        if (~['TABLE', 'SPAN'].indexOf(e.target.tagName)) {
            //span for ie fix
            var keys = chApp.namespace('events.KEY'),
                keyCode = e.keyCode,
                catchKeys = [keys.UP, keys.DOWN, keys.DEL];
            /**
             * #tips 1
             */
            if (~catchKeys.indexOf(keyCode)) {
                var factory = chApp.namespace('factory'),
                    form = factory.getChGridForm($(this).closest('form')),
                    $activeRow,
                    $nextRow;

                if (keyCode == keys.DEL) {
                    form.removeRows(form.getSelectedRows());
                } else if ((e.ctrlKey || e.shiftKey) && ~[keys.UP, keys.DOWN].indexOf(keyCode)) {
                    $activeRow = form.getActiveRow();
                    if (keyCode == keys.DOWN) {
                        $nextRow = $activeRow.next('tr');
                    } else {
                        $nextRow = $activeRow.prev('tr');
                    }
                    if ($nextRow.length) {
                        form.setCorrectScroll($nextRow);
                        form.selectRow($nextRow, true, false);
                    }
                } else if (~[keys.UP, keys.DOWN].indexOf(keyCode)) {
                    $activeRow = form.getActiveRow();
                    if (keyCode == keys.UP) {
                        $nextRow = $activeRow.prev('tr');
                    } else {
                        $nextRow = $activeRow.next('tr');
                    }
                    if ($nextRow.length) {
                        form.setCorrectScroll($nextRow);
                        form.selectRow($nextRow, false, false);
                    }
                }
                return false;
            }
        }
        return true;
    },
    selectFormRowEvent: function ($context) {
        $context.on('click', 'tbody > tr', this.selectFormRowHandler);
    },
    /**
     * @param e {Event}
     */
    selectFormRowHandler: function (e) {
        var factory = chApp.namespace('factory'),
            $this = $(this),
            form = factory.getChGridForm($this.closest('form'));
        form.selectRow($this, e.ctrlKey || e.shiftKey, true);
    },
    contextFormMenuEvent: function ($context) {
        var main = chApp.namespace('main'),
            messages = chApp.namespace('options.messages')[main.locale];
        $context.contextmenu({
            delegate: 'span.card-button, td.attachment-grid-menu',
            show: { effect: 'blind', duration: 0 },
            menu: [
                {title: messages.Delete + ' [DEL]', cmd: 'delete', uiIcon: 'ui-icon-trash'}
            ],
            select: function (e, ui) {
                var factory = chApp.namespace('factory');
                switch (ui.cmd) {
                    case 'delete':
                        var form = factory.getChGridForm(ui.target.closest('form'));
                        form.removeSelectedRows();
                        break;
                    default :
                        break;
                }
            }
        });
    },
    cardCancelEvent: function ($context) {
        $context.on('click', '.card-cancel', this.cardCancelHandler)
    },
    cardCancelHandler: function () {
        var factory = chApp.namespace('factory'),
            card = factory.getChCard($(this).closest('[data-id=grid-tabs]'));
        card.undoChange();
    },
    addRowToForm: function ($context) {
        $context.on('click', '.menu-button-add', this.addRowToFormHandler);
    },
    addRowToFormHandler: function () {
        var factory = chApp.namespace('factory'),
            urls = chApp.namespace('options.urls'),
            form = factory.getChGridForm($(this).closest('form'));
        if (form.isAjaxAdd()) {
            $.get(urls.addRow, {view: form.getView()})
                .done(function (res) {
                    var response = new ChResponse(res);
                    if (response.isSuccess()) {
                        var defData = $.extend({}, form.getDefaultObj(), response.getData());
                        form.addRow(defData);
                    } else {
                        response.sendMessage(form.getMessagesContainer());
                    }
                })
                .fail(function (e) {
                    var resStatuses = chApp.namespace('responseStatuses'),
                        main = chApp.namespace('main');
                    form.getMessagesContainer().sendMessage(e.responseText, resStatuses.ERROR);
                    main.log.error(
                        'Ошибка при получении данных при создании новой строки:',
                        e.responseText,
                        e.statusText,
                        e.status
                    );
                });
        } else {
            var defData = $.extend({}, form.getDefaultObj());
            form.addRow(defData);
        }
    },
    saveFormEvent: function ($context) {
        $context.on('click', '.menu-button-save', this.saveFormHandler);
    },
    saveFormHandler: function () {
        var factory = chApp.namespace('factory'),
            form = factory.getChGridForm($(this).closest('form'));
        form.save(true);
    },
    cardSaveEvent: function ($context) {
        $context
            .on('click', '.card-menu-save', this.cardSaveFromMenuHandler)
            .on('click', '.card-save', this.cardSaveButtonHandler);
    },
    cardSaveFromMenuHandler: function () {
        var main = chApp.namespace('main'),
            factory = chApp.namespace('factory'),
            card = factory.getChCard($(this).closest('header').siblings('[data-id=grid-tabs]'));
        main.leaveFocus();
        card.save();
    },
    cardSaveButtonHandler: function () {
        var main = chApp.namespace('main'),
            factory = chApp.namespace('factory'),
            card = factory.getChCard($(this).closest('[data-id=grid-tabs]'));
        main.leaveFocus();
        card.save();
    },
    refreshFormEvent: function ($context) {
        $context.on('click', '.menu-button-refresh', this.refreshFormHandler);
    },
    refreshFormHandler: function () {
        var factory = chApp.namespace('factory'),
            main = chApp.namespace('main'),
            messages = chApp.namespace('options.messages')[main.locale],
            form = factory.getChGridForm($(this).closest('form'));
        if (form.isHasChange()) {
            var $dialog = $('<div>' + messages.refreshForm + '</div>');
            $dialog.dialog({
                title: messages.projectName,
                dialogClass: 'wizard-dialog refresh-dialog',
                resizable: false,
                height: 140,
                modal: true,
                buttons: {
                    'Да': function () {
                        $(this).dialog("close");
                        form.save(true);
                    },
                    'Нет': function () {
                        $(this).dialog("close");
                        form.refresh();
                    },
                    'Отмена': function () {
                        $(this).dialog("close");
                    }
                },
                create: function () {
                    var $buttons = $(this).siblings('div').find("button");
                    $buttons.first()
                        .addClass("wizard-next-button")
                        .nextAll().
                        addClass('wizard-cancel-button');
                }
            });
        } else {
            form.refresh();
        }
    },
    openTaskWizardEvent: function ($context) {
        $context.on('click', chApp.namespace('options.settings.taskWizardSelector'), this.openTaskWizardHandler);
    },
    openTaskWizardHandler: function () {
        var factory = chApp.namespace('factory'),
            clsSel = chApp.namespace('main.clsSel'),
            classes = chApp.namespace('options.classes'),
            form = factory.getChGridForm(
                $(this)
                    .closest(clsSel(classes.headerSection))
                    .siblings(clsSel(classes.gridSection))
                    .children('form')
            );
        (new TaskWizard(form)).open();
        return false;
    },
    /**
     * @param e {Event}
     * @returns {boolean}
     */
    addSignToIframeHandler: function (e) {
        if (e.data && e.data.editor) {
            var editor = e.data.editor;
            if(e.data.red){
                if (editor.toolbar.commandMapping['foreColor:red'].state === false) {
                    editor.composer.commands.exec("foreColor", 'red');
                }
            }else{
                if (editor.toolbar.commandMapping['foreColor:red'].state && editor.toolbar.commandMapping['foreColor:silver'].state === false) {
                    editor.composer.commands.exec("foreColor", 'silver');
                }
            }

        }
        var moduleKey = chApp.namespace('events.KEY'),
            moduleMain = chApp.namespace('main');
        if (e.keyCode == moduleKey.F4) {
            $(this).insertAtCaretIframe(moduleMain.user.getSign());
            return false;
        }
        return true;
    },
    signInTextEvents: function ($context) {
        $context.on('keydown', 'textarea', this.addSignToTextHandler);
    },
    /**
     * @param e {Event}
     * @returns {boolean}
     */
    addSignToTextHandler: function (e) {
        var keys = chApp.namespace('events.KEY'),
            user = chApp.namespace('main.user');
        if (e.keyCode == keys.F4) {
            $(e.target).insertAtCaret(user.getSign());
            return false;
        }
        return true;
    },
    preventDefaultBrowserEvents: function ($context) {
        $context.on('keydown', function (e) {
            /**
             * #tip 1
             */
            var keys = chApp.namespace('events.KEY'),
                isTextEditMode = ~['INPUT', 'TEXTAREA'].indexOf(e.target.tagName);
            if (e.keyCode == keys.BACKSPACE && !isTextEditMode) {
                e.preventDefault();
            }
            if (e.keyCode == keys.F5 && isTextEditMode) {
                e.preventDefault();
            }
        })
    },
    disableFiltersEvent: function ($context) {
        $context.on('click', '.section-filters div > label', this.disableFilterHandler);
        $context.on('click', '.filter-mock-no-edit', this.enableFilterEvent);
    },
    enableFilterEvent: function () {
        var $this = $(this),
            $controls = $this.parent().find('select, input');
        $controls.prop('disabled', false);
        $controls.filter('input')
            .focus()
            .trigger('click');
        $this.remove();

        return false;
    },
    disableFilterHandler: function () {
        var $this = $(this);
        $this.siblings('select, input').prop('disabled', true);
        $this.closest('.filter-item').prepend('<div class="filter-mock-no-edit"></div>');
    }
};
