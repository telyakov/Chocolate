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
        //this.signInTextEvents($content);
    },
    tabHistoryLogEvent: function ($context) {
        $context.on('click', '#tabs>ul>li', this.tabHistoryLogHandler);
    },
    tabHistoryLogHandler: function () {
        facade.getTabsModule().push($(this));
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
    }
};
