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
    },
    tabHistoryLogEvent: function ($context) {
        $context.on('click', '#tabs>ul>li', this.tabHistoryLogHandler);
    },
    tabHistoryLogHandler: function () {
        facade.getTabsModule().push($(this));
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
        //todo: вернуть код
        facade.getFactoryModule().makeChGridForm($(this).closest('form'))
            .toggleSystemCols();
            //.clearSelectedArea();
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
                        //todo: времено удалено. Перенести в модель
                        //form.removeSelectedRows();
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
