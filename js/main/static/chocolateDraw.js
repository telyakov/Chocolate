function ChocolateDrawClass() {
    var context = this, tabsCache = [];
    /**
     * @returns {ChocolateDrawClass}
     */
    this.reflowActiveTab = function () {
        return context.reflowTab(chApp.getMain().getActiveChTab());
    };
    /**
     * @param tab {ChTab}
     * @returns {boolean}
     * @private
     */
    this._isNeedReflow = function (tab) {
        return tabsCache.indexOf(tab.getID()) === -1;
    };
    /**
     * @returns {ChocolateDrawClass}
     */
    this.clearTabsCache = function () {
        tabsCache = [];
        return context;
    };
    /**
     *
     * @param tab {ChTab}
     * @private
     */
    this._addTabToCache = function (tab) {
        tabsCache.push(tab.getID());
    };
    /**
     * @param tab {ChTab}
     * @returns {ChocolateDrawClass}
     */
    this.reflowTab = function (tab) {
        var $cont;
        if (tab.isCardTypePanel()) {
            $cont = tab.getPanel();
            if (context._isNeedReflow(tab)) {
                context
                    .drawCard($cont)
                    ._addTabToCache(tab);
            }
            var cardTab = chApp.getFactory().getChTab($cont.find(Chocolate.clsSel(ChOptions.classes.activeTab)).children('a'));
            if (context._isNeedReflow(cardTab)) {
                var $panel = cardTab.getPanel(),
                    _this = context;
                context.drawCardPanel($panel, $cont);
                context.drawCardControls(cardTab.getCardContent());
                $panel.find('div.card-grid').each(function () {
                    var $cardCol = $(this).parent();
                    _this.drawCardGrid($cardCol);
                    $cardCol.find('div[data-id=user-grid]').find('table').each(function () {
                        $(this).floatThead('reflow');
                    });
                });
                context._addTabToCache(cardTab);
            }
        } else {
            if (context._isNeedReflow(tab)) {
                //Для сеток
                $cont = tab.getPanel();
                context.drawGrid($cont);
                $cont.find('div[data-id=user-grid]').find('table').each(function () {
                    $(this).floatThead('reflow');
                });
                var $discussionForm = $cont.children('section').children('form');
                if ($discussionForm.hasClass('discussion-form')) {
                    var $discussionInputSection = $discussionForm.next('.discussion-footer');
                    $discussionForm.height($cont.height() - $discussionInputSection.outerHeight(true));

                }
                context._addTabToCache(tab);
            }
        }
        return context;
    };
    this._drawContent = function ($context) {
        var windowsHeight = Chocolate.$window.height(),
            headerHeight = Chocolate.$header.height(),
            footerHeight = Chocolate.$footer.height(),
            pagewrapHeight = windowsHeight - headerHeight - footerHeight;

        $(Chocolate.$page, Chocolate.$content, Chocolate.$tabs).height(pagewrapHeight);
        var $tabList = Chocolate.$tabs.children('ul').eq(0),
            pageContentDelta = $context.outerHeight() - $context.height(),
            pageContentHeight = pagewrapHeight - $tabList.outerHeight(true) - pageContentDelta;

        $context.height(pageContentHeight);
        return pageContentHeight;
    };
    this._drawGridForm = function ($context) {
        if ($context.children('form').hasClass('discussion-form')) {
            var $discussionForm = $context.children('form');
            var $discussionInputSection = $discussionForm.next('.discussion-footer');
            $discussionForm.height($context.height() - $discussionInputSection.outerHeight(true));

        } else {
            var $contentHeader = $context.find('section[data-id=header]'),
                $contentFilters = $context.find('section[data-id=filters]'),
                $contentGridForm = $context.find('section[data-id=grid-form]'),
                contentGridFormHeight = $context.height() - $contentHeader.outerHeight(true) - $contentFilters.outerHeight(true);
            $contentGridForm.height(contentGridFormHeight);

            var $form = $contentGridForm.children('form'),
                $footer = $contentGridForm.children('footer'),
                formHeight = contentGridFormHeight - $footer.outerHeight(true);
            $form.height(formHeight);

            var $menu = $form.find('menu'),
                $gridSection = $form.children('section'),
                gridSectionHeight = formHeight - $menu.outerHeight(true);
            $gridSection.height(gridSectionHeight);
            if ($gridSection.attr('data-id') === 'map') {
                var chMap = ChObjectStorage.create($gridSection.children('.map'), 'ChMap');
                chMap.map.container.fitToViewport();

            } else {
                var $userGrid = $gridSection.find('div[data-id=user-grid]');
                $userGrid.height(gridSectionHeight);
            }
        }
    };
    /**
     * Полностью рисует сетку, расположенную не в карточке. Можно использовать при ресайзинге.
     * @param $context
     */
    this.drawGrid = function ($context) {
        var $cardTabs = $context.parent();
        if ($cardTabs.attr('data-id') !== 'grid-tabs') {
            /**
             * Перерисовываем внешние контейнеры
             */
            context._drawContent($context);
            /**
             *  Перерисовываем саму сетку.
             */
            context._drawGridForm($context);
        }
    };
    /**
     * Рисует когнтейнер карточки.
     * @param $context
     */
    this.drawCard = function ($context) {
        context._drawContent($context);
        var $header = $context.children('header'),
            $content = $context.children('div[data-id=grid-tabs]'),
            contentHeight = $context.height() - $header.outerHeight(true);
        $content.height(contentHeight);
        return context;
    };
    /**
     * Рисует одну из панелей в карточке.
     */
    this.drawCardPanel = function ($panel, $context) {
        var $gridTabs = $context.children('div[data-id=grid-tabs]'),
            $tabList = $gridTabs.children('ul'),
            deltaHeight = $panel.outerHeight(true) - $panel.height(),
            panelHeight = $gridTabs.height() - $tabList.outerHeight(true) - deltaHeight - 1;

        $panel.height(panelHeight);
    };
    /**
     * Рисует контролы в карточке. Точнее отрисовывает контейнер в котором они лежат.
     * @param $cardContent
     */
    this.drawCardControls = function ($cardContent) {
        var $container = $cardContent.parent(),
            buttonHeight = 25,
            cardHeight = $container.height() - buttonHeight - 10;

        $cardContent.height(cardHeight);
        var $cardActionButtons = $container.children('.card-action-button');
        $cardActionButtons.height(buttonHeight);
        context.drawCardElements($cardContent);
    };
    this.drawCardElements = function ($card) {
        var staticRows = [],
            rowsCount = parseInt($card.attr('data-rows'), 10),
            cardHeight = $card.height(),
            dynamicRowHeight = parseInt(cardHeight / rowsCount, 10),
            rowHeight = [],
            minRowsHeight = [],
            $cols = $card.find('.card-col'),
            staticClass = chApp.getOptions().classes.staticCardElement;

        $cols.each(function (index, col) {
            var $col = $(col),
                startRow = parseInt($col.attr('data-y'), 10),
                colRowCount = parseInt($col.attr('data-rows'), 10),
                isStatic = $col.hasClass(staticClass),
                minHeight = parseInt($col.attr('data-min-height'), 10),
                i = 0;
            while (i < colRowCount) {
                var curRowIndex = startRow + i;
                if (isStatic) {
                    if (jQuery.inArray(curRowIndex, staticRows) === -1) {
                        staticRows.push(curRowIndex);
                        rowHeight[curRowIndex] = minHeight + 5;
                        minRowsHeight[curRowIndex] = minHeight + 5;
                    }
                } else {
                    if (typeof rowHeight[curRowIndex] === 'undefined') {
                        rowHeight[curRowIndex] = dynamicRowHeight;
                        minRowsHeight[curRowIndex] = minHeight / colRowCount;
                    } else {
                        minRowsHeight[curRowIndex] = Math.max(minHeight / colRowCount, minRowsHeight[curRowIndex]);
                    }
                }
                i += 1;
            }
        });
        var actualHeight = [],
            cardMinHeight = 0,
            i = 1;
        while (i <= rowsCount) {
            var minH = parseInt(minRowsHeight[i], 10),
                realH = parseInt(rowHeight[i], 10);
            if (isNaN(minH)) {
                minH = 0;
            }
            if (isNaN(realH)) {
                realH = 0;
            }
            cardMinHeight += minH;
            actualHeight.push(Math.max(minH, realH));
            i += 1;
        }

        $cols.each(function (index, col) {
            var $col = $(col),
                dataY = parseInt($col.attr('data-y'), 10),
                countRow = parseInt($col.attr('data-rows'), 10);

            var height = actualHeight
                .filter(function (value, index) {
                    return (index + 1) >= dataY && (index + 1) < (countRow + dataY);
                })
                .reduce(function (previousStr, currentItem) {
                    return previousStr + currentItem;
                });
            $col.height(height - 6);
            var sum = actualHeight
                .filter(function (value, index) {
                    return index + 1 < dataY;
                });
            if (sum.length > 0) {
                sum = sum.reduce(function (previousStr, currentItem) {
                    return previousStr + currentItem;
                });
            } else {
                sum = 0;
            }
            var $input = $col.children('.card-input');
            if ($input.hasClass('card-grid')) {
                $input.height(height);
            } else {
                if ($col.hasClass('card-static')) {
                    $input.height(21);

                } else {
                    $input.height(height - 26);

                }
            }
            $col.css({top: sum});
        });
        $card.parent().css({'min-height': cardMinHeight + $card.siblings('header').height()} + $card.find('.action-button-panel').height());
    };
    /**
     * Рисуем сетку в карточке
     * @param $cardCol {jQuery}
     */
    this.drawCardGrid = function ($cardCol) {
        var $cardGrid = $cardCol.find('.card-grid'),
            cardGridHeight = $cardGrid.height(),
            $section = $cardGrid.children('section');
        $section.height(cardGridHeight);
        context._drawGridForm($section);
    };
}