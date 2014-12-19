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
            $body = $('body');
        this.ajaxIndicatorEvent();
        this.closeTabEvent($content);
        this.menuContextEvent($tabs);
        this.contextFormMenuEvent($tabs);
        this.cardCancelEvent($tabs);
        this.saveFormEvent($tabs);
        this.cardSaveEvent($tabs);
        this.reflowTabEvent($tabs);
        this.tabHistoryLogEvent($content);
        this.reflowWindowEvent($window);
        this.openTaskWizardEvent($content);
        this.signInTextEvents($content);
        this.disableFiltersEvent($content);
        this.toggleSystemColsEvent($tabs);
        this.warningMessageEvent($window);
        this.formMenuButtonEvent($tabs);
        this.makeCallEvent($body);
        this.preventDefaultBrowserEvents($window);
        this.keyActionsCardEvent($tabs);
        this.deselectTreeElementEvent($body);
        this.modalFormElementEvent($content);
        this.searchColumnsEvent($tabs);
        this.sendEmailEvent($tabs);
        this.sendMessageEvent($tabs);
        this.openCardTabMenuEvent($tabs);
        this.filterTreeEvent($body);
        this.contentExpandEvent($tabs);
    },
    contentExpandEvent: function ($cnt) {
        $cnt.on('click', '.menu-button-expand', this.contentExpandHandler);
    },
    contentExpandHandler: function () {
        var $this = $(this),
            $expandSection = $this.closest('section');
        $this.toggleClass('menu-button-selected');
        $expandSection.siblings('.section-header, .section-filters').toggleClass('expand-hidden');
        var $expandCardCol = $expandSection.closest('.card-col');
        if ($expandCardCol.length) {
            $expandCardCol.toggleClass('expand-card-visible');
            $expandCardCol.siblings('.card-col').toggleClass('expand-hidden');
        }
        facade.getRepaintModule().reflowActiveTab(true);

    },
    filterTreeEvent: function ($cnt) {
        $cnt.on('click', '.filter-button', this.filterTreeHandler);
    },
    filterTreeHandler: function () {
        var $this = $(this),
            $tree = $this.closest('div').siblings('.widget-tree'),
            nodes = $tree.find('li');
        $this.toggleClass('menu-button-selected');
        var selectedNodes = nodes.filter(function () {
            return $(this).has('.dynatree-selected').length === 0;
        });
        if ($this.hasClass('menu-button-selected')) {
            selectedNodes.hide();
        } else {
            selectedNodes.show();
        }
    },
    openCardTabMenuEvent: function ($context) {
        $context.on('click', '.tab-menu-link', this.openCardTabMenuHandler);
    },
    openCardTabMenuHandler: function () {
        var $this = $(this),
            $tabs = $this.closest('.tab-menu').prevAll('.ui-tabs-nav').find('a'),
            menu = [],
            activeClass = chApp.getOptions().classes.activeTab;
        $tabs.each(function () {
            var item = {
                title: $(this).text(),
                cmd: $(this).attr('id')
            };
            if ($(this).parent().hasClass(activeClass)) {
                item.uiIcon = 'ui-icon-check';
            }
            menu.push(item);
        });
        $(this).contextmenu({
            show: {effect: "blind", duration: 0},
            menu: menu,
            select: function (event, ui) {
                $('#' + ui.cmd).trigger('click');
            }
        });
        $(this).contextmenu('open', $(this));
    },
    sendMessageEvent: function ($context) {
        $context.on('click', '.discussion-submit', this.sendMessageHandler);
    },
    sendMessageHandler: function () {
        var msg = $(this).prev('.discussion-input').val();
        var form = facade.getFactoryModule().makeChDiscussionForm($(this).closest('section').prev('form'));
        form.sendMessage(msg);
    },
    sendEmailEvent: function ($context) {
        $context.on('click', '.fm-email-send', this.sendEmailHandler);
    },
    sendEmailHandler: function () {
        var form = facade.getFactoryModule().makeChGridForm($(this).closest('.section-header').siblings('.section-grid').children('form'));
        var id = form.getActiveRowID();
        if (id) {
            var dataObj = form.getDataObj()[id],
                emailCol = chApp.getOptions().settings.emailCol,
                emails = dataObj[emailCol],
                url = encodeURIComponent(chApp.getOptions().urls.bpOneTask + id),
                task = chApp.getMain().stripHtml(dataObj.task),
                subject = 'База:' + task.substr(0, 50);

            window.open('mailto:' + emails + '?subject=' + subject + '&body=' + url, '_self');

        }
    },
    searchColumnsEvent: function ($context) {
        $context.on('keydown', '.grid-column-search', $.debounce(200, false, this.searchColumnsHandler));
    },
    searchColumnsHandler: function (e) {
        var keys = chApp.events.KEY,
            $this = $(this),
            form = facade.getFactoryModule().makeChGridForm($this.closest('form')),
            $th = form.getTh(),
            searchedClass = chApp.getOptions().classes.searchedColumn,
            $fixedTable = form.getFixedTable(),
            $table = form.getTable(),
            tables = [$table.eq(0)[0], $fixedTable.eq(0)[0]],
            search = $this.val();
        if ([keys.ENTER, keys.ESCAPE].indexOf(e.keyCode) === -1) {

            var oldHiddenPositions = [],
                hiddenPositions = [];
            $th.each(function (i) {
                var $this = $(this),
                    index = $this.get(0).cellIndex;
                if ($this.hasClass(searchedClass)) {
                    oldHiddenPositions.push(index);
                }
                if ($this.css('display') !== 'none' || $this.hasClass(searchedClass)) {
                    var caption = $(this).text().toLowerCase();
                    $this.removeClass(searchedClass);

                    if (i !== 0 && caption !== chApp.getOptions().settings.keyCaption && caption.indexOf(search) === -1) {
                        hiddenPositions.push(index);
                        $this.addClass(searchedClass);
                    }
                }
            });
            var visiblePositions = [],
                sum = 0,
                curWidth = $table.width(),
                newWidth;
            oldHiddenPositions.forEach(function (item) {
                if (hiddenPositions.indexOf(item) === -1) {
                    visiblePositions.push(item);
                    sum += parseInt(form.getColumnWidth(item), 10);
                }
            });

            var newHiddenPositions = [];
            hiddenPositions.forEach(function (item) {
                if (oldHiddenPositions.indexOf(item) === -1) {
                    newHiddenPositions.push(item);
                    sum -= parseInt(form.getColumnWidth(item), 10);
                }
            });
            var tableHelperModule = chApp.getTableHelper();
            tableHelperModule.hideColsManyTables(tables, newHiddenPositions);
            tableHelperModule.showColsManyTables(tables, visiblePositions);
            newWidth = curWidth + sum;
            $table.width(newWidth);
            $fixedTable.width(newWidth);
            $table.floatThead('reflow');
        } else {
            $(this).val('');
            var positions = [];
            $th.each(function (i) {
                if ($(this).hasClass(searchedClass)) {
                    positions.push(i);
                    $(this).removeClass(searchedClass);
                }
            });
            chApp.getTableHelper().showColsManyTables(tables, positions);
            if (e.keyCode === keys.ESCAPE) {
                $th
                    .filter('.grid-column-searched-red, .grid-column-searched-yellow, .grid-column-searched-green')
                    .removeClass('grid-column-searched-red grid-column-searched-yellow grid-column-searched-green');
            } else {
                var $parent = $th.parent(),
                    color = $parent.attr('data-color');
                if (!color || color === 'green') {
                    $parent.attr('data-color', 'yellow');
                }
                if (color === 'yellow') {
                    $parent.attr('data-color', 'red');
                }
                if (color === 'red') {
                    $parent.attr('data-color', 'green');
                }
                $th.each(function () {
                    var caption = $(this).text().toLowerCase();
                    if (caption.indexOf(search) !== -1) {
                        $(this)
                            .removeClass('grid-column-searched-red grid-column-searched-yellow grid-column-searched-green')
                            .addClass('grid-column-searched-' + $parent.attr('data-color'));
                    } else {
                        $(this).removeClass('grid-column-searched-' + $parent.attr('data-color'));

                    }
                });

            }
        }
        form.clearSelectedArea();
    },
    tabHistoryLogEvent: function ($context) {
        $context.on('click', '#tabs>ul>li', this.tabHistoryLogHandler);
    },
    tabHistoryLogHandler: function () {
        facade.getTabsModule().push($(this));
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
            column = facade.getFactoryModule().makeChGridColumnBody($elem),
            $popupControl = $('<a class="grid-textarea"></a>');
        Chocolate.leaveFocus();
        $popupControl.appendTo($cell.closest('section'));
        if (isMarkupSupport) {
            chFunctions.wysiHtmlInit($popupControl, ChEditable.getTitle(column.getID(), caption));
        } else {
            $popupControl.editable({
                type: 'textarea',
                mode: 'popup',
                onblur: 'ignore',
                savenochange: false,
                title: ChEditable.getTitle(column.getID(), caption)
            });
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
            editor.on('load', function () {
                $textArea.siblings('iframe').eq(1).contents().find('body')
                    .on('keydown', eventData, ChocolateEvents.addSignToIframeHandler)
                    .on('keydown', function (e) {
                        var keys = chApp.namespace('events.KEY');
                        if (e.keyCode === keys.ESCAPE) {
                            $popupControl.editable('hide');
                        }
                    });
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
        $context.on('keydown', '.card-input a', this.keyActionsCardHandler);
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
    openChildGridHandler: function () {
        var main = chApp.namespace('main'),
            $editable = $(this).find('.editable'),
            options = $editable.data().editable.options,
            view = options.view,
            column = facade.getFactoryModule().makeChGridColumnBody($editable),
            form = column.getChForm(),
            parentID = column.getID(),
            isNew = !$.isNumeric(parentID),
            parentView = form.getView(),
            tabID = ChGridColumn.createChildGridTabID(parentID, view, parentView),
            $tabs = main.$tabs,
        template = form.getFmChildGridCollection().getCardTemplate(view, parentView, isNew),
            $currentTab = $tabs.find("[aria-controls='" + tabID + "']"),
            toID = options.toID,
            toName = options.toName,
            fromID = options.fromID,
            fromName = options.fromName,
            isSelect = '';
        if (toID && toName && fromName && fromID) {
            isSelect = 1;
        }
        Chocolate.leaveFocus();
        if ($currentTab.length) {
            $tabs.tabs("select", tabID);
        } else {
            var caption = [options.title, ' [', parentID, ']'].join('');
            facade.getTabsModule().addAndSetActive(tabID, caption);
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
                                $html = facade.getHelpersModule().layoutTemplate(template, parentID);
                            try {
                                $('<div></div>')
                                    .attr('id', tabID)
                                    .appendTo($tabs)
                                    .html($html);
                                $('#' + tabID).find('.grid-select').on('click', function () {
                                        var form = facade.getFactoryModule().makeChGridForm($(this).closest('.grid-footer').prev('form'));
                                        if (form.isHasChange()) {
                                            form.getMessagesContainer().sendMessage('Сохраните сетку, перед выбором!', ChResponseStatus.ERROR);
                                        } else {
                                            var selectedRows = form.getSelectedRows();
                                            if (selectedRows.length !== 1) {
                                                form.getMessagesContainer().sendMessage('Выберите одну строчку', ChResponseStatus.ERROR);
                                            }
                                            //todo: реализовать алгоритм биндинга
//                                                    var rowID = factory.getSelectedRows[0].attr('data-id');
//                                                    var data =  form.getDataObj()[rowID];
//                                                    var $tr = $editable.closest('tr');
//                                                    factory.getChGridColumnBody()
//                                                    column.setChangedValue(toID, data[fromID]);
//                                                    editable.html(data[fromName])
                                        }
                                    }
                                );
                                $tabs.tabs("refresh");
                                form.getFmChildGridCollection().setCardTemplate(view, parentView, template, isNew);
                            } catch (er) {
                                mediator.publish(facade.getOptionsModule().getChannel('logError'),
                                    'Возникла ошибка при вставке html+ js дочерней сетке в DOM',
                                    er
                                );
                                $html.remove();
                            }
                        } else {
                            mediator.publish(facade.getOptionsModule().getChannel('logError'),
                                response.getStatusMsg
                            );
                        }
                    })
                    .fail(function (er) {
                        mediator.publish(facade.getOptionsModule().getChannel('logError'),
                            'Возникла ошибка при открытии дочерней карточки',
                            er
                        );
                    });
        } else {
            $('<div></div>')
                .attr('id', tabID)
                .appendTo($tabs)
                .html(facade.getHelpersModule().layoutTemplate(template, parentID));
        }
        }
        return false;
    },
    makeCallEvent: function ($context) {
        $context.on('click', '.fm-phone', this.makeCallHandler);
    },
    makeCallHandler: function () {
        var phoneTo = $(this).attr('data-phone');
        facade.getPhoneModule().makeCall(phoneTo);
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
        var form = facade.getFactoryModule().makeChGridForm($(this).closest('form'));
        form.exportToExcel();
    },
    openFormSettingHandler: function () {
        var form = facade.getFactoryModule().makeChGridForm($(this).closest('form'));
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
            var messages = chApp.getMessages();
            return messages.chocolateHasChange;
        }
    },
    toggleSystemColsEvent: function ($context) {
        $context.on('click', '.menu-button-toggle', this.toggleSystemColsHandler);
    },
    toggleSystemColsHandler: function () {
        facade.getFactoryModule().makeChGridForm($(this).closest('form'))
            .toggleSystemCols()
            .clearSelectedArea();
    },
    reflowWindowEvent: function ($context) {
        $context.on('resize', $.debounce(300, false, this.reflowWindowHandler));
    },
    reflowWindowHandler: function () {
        facade.getRepaintModule().clearCache();
        mediator.publish(optionsModule.getChannel('reflowTab'));
    },
    reflowTabEvent: function ($context) {
        $context.on('mouseup', '.ui-tabs-anchor[href=1]', this.reflowTabHandler);
        $context.on('click', '.ui-tabs-anchor[href^=#]', this.reflowTabHandler);
    },
    reflowTabHandler: function () {
        mediator.publish(facade.getOptionsModule().getChannel('reflowTab'));

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
        facade.getTabsModule().close($(this));
        return false;
    },
    menuContextEvent: function ($context) {
        $context.on('click ', '.menu-button-print, .menu-button-action', this.menuContextHandler);
    },
    menuContextHandler: function () {
        var $this = $(this);
        $this.contextmenu('open', $this);
    },

    contextFormMenuEvent: function ($context) {
        var main = chApp.namespace('main'),
            messages = chApp.getMessages();
        $context.contextmenu({
            delegate: 'span.card-button, td.attachment-grid-menu',
            show: {effect: 'blind', duration: 0},
            menu: [
                {
                    title: messages.Delete + ' [DEL]',
                    cmd: 'delete',
                    uiIcon: 'ui-icon-trash'
                }
            ],
            select: function (e, ui) {
                switch (ui.cmd) {
                    case 'delete':
                        var form = facade.getFactoryModule().makeChGridForm(ui.target.closest('form'));
                        form.removeSelectedRows();
                        break;
                    default :
                        break;
                }
            }
        });
    },
    cardCancelEvent: function ($context) {
        $context.on('click', '.card-cancel', this.cardCancelHandler);
    },
    cardCancelHandler: function () {
        var card = facade.getFactoryModule().makeChCard($(this).closest('[data-id=grid-tabs]'));
        card.undoChange();
    },
    saveFormEvent: function ($context) {
        $context.on('click', '.menu-button-save', this.saveFormHandler);
    },
    saveFormHandler: function () {
        var form = facade.getFactoryModule().makeChGridForm($(this).closest('form'));
        form.save(true);
    },
    cardSaveEvent: function ($context) {
//            .on('click', '.card-menu-save', this.cardSaveFromMenuHandler)
        $context
            .on('click', '.card-save', this.cardSaveButtonHandler);
    },
    cardSaveFromMenuHandler: function () {
        var main = chApp.namespace('main'),
            card = facade.getFactoryModule().makeChCard($(this).closest('header').siblings('[data-id=grid-tabs]'));
        main.leaveFocus();
        card.save();
    },
    cardSaveButtonHandler: function () {
        var main = chApp.namespace('main'),
            card = facade.getFactoryModule().makeChCard($(this).closest('[data-id=grid-tabs]'));
        main.leaveFocus();
        card.save();
    },
    openTaskWizardEvent: function ($context) {
        $context.on('click', '.fm-wizard-task', this.openTaskWizardHandler);
    },
    openTaskWizardHandler: function () {
        var $this = $(this),
            tw = facade.getTaskWizard(),
            form = facade.getFactoryModule().makeChGridForm(
                $(this)
                    .closest('.' + optionsModule.getClass('headerSection'))
                    .siblings('.' + optionsModule.getClass('gridSection'))
                    .children('form')
            );
        $this.chWizard('init', {
            commandObj: tw.makeCommandObject(form),
            onDone: tw.onDoneFunc(),
            commands: [
                tw.makeServiceCommand(),
                tw.makeExecutorsCommand(),
                tw.makeDescriptionCommand()
            ]
        });
        return false;
    },
    /**
     * @param e {Event}
     * @returns {boolean}
     */
    addSignToIframeHandler: function (e) {
        var moduleKey = chApp.namespace('events.KEY'),
            userModule = facade.getUserModule();
        if (e.keyCode === moduleKey.F4) {
            $(this).insertAtCaretIframe(userModule.getSign());
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
            userModule = facade.getUserModule();
        if (e.keyCode === keys.F4) {
            $(e.target).insertAtCaret(userModule.getSign());
            return false;
        }
        return true;
    },
    preventDefaultBrowserEvents: function ($context) {
        $context.on('keydown', function (e) {
            var isNotTextEditMode = (['INPUT', 'TEXTAREA'].indexOf(e.target.tagName) === -1);
            if (isNotTextEditMode) {
                var keys = chApp.namespace('events.KEY');

                if (e.keyCode === keys.BACKSPACE) {
                    e.preventDefault();
                }
                if (e.keyCode === keys.ESCAPE && e.target.tagName === 'BODY') {
                    var tab = facade.getTabsModule().getActiveChTab();
                    if (tab.isCardTypePanel()) {
                        var card = facade.getFactoryModule().makeChCard(tab.getPanel().children('[data-id=grid-tabs]'));
                        if (!card._isChanged() && $(e.target).children('.fancybox-overlay').length === 0) {
                            facade.getTabsModule().closeActiveTab();
                        }
                    }
                }
            }
        });
    },
    disableFiltersEvent: function ($context) {
        $context.on('click', '.section-filters div > label', this.disableFilterHandler);
        $context.on('click', '.filter-mock-no-edit', this.enableFilterEvent);
    },
    enableFilterEvent: function () {
        var $this = $(this),
            $controls = $this.parent().find('select, input');
        $controls.prop('disabled', false);
        $controls.filter('input').eq(0)
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
