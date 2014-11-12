var repaintModule = (function(){
    function ChocolateDraw() {
        var context = this, tabsCache = [];
        /**
         * @param $context {jQuery}
         * @returns {int}
         * @private
         */
        this._setTabHeight = function ($context) {
            var mainModule = chApp.getMain(),
                windowsHgh = mainModule.$window.height(),
                headerHgh = mainModule.$header.height(),
                footerHgh = mainModule.$footer.height(),
                pageHgh = windowsHgh - headerHgh - footerHgh;
            $(mainModule.$page, mainModule.$content, mainModule.$tabs).height(pageHgh);
            var $tabItems = mainModule.$tabs.children('ul').eq(0),
                pagePaddingHgh = $context.outerHeight() - $context.height(),
                correctPageHgh = pageHgh - $tabItems.outerHeight(true) - pagePaddingHgh;
            $context.height(correctPageHgh);
            return correctPageHgh;
        };
        /**
         *
         * @param $form {jQuery}
         * @returns {boolean}
         * @private
         */
        this._isDiscussionForm = function ($form) {
            var discussionClass = chApp.getOptions().classes.discussionForm;
            return $form.hasClass(discussionClass);
        };
        /**
         *
         * @param $context {jQuery}
         * @private
         */
        this._layoutForm = function ($context) {
            if (this._isDiscussionForm($context.children('form'))) {
                var $discussionForm = $context.children('form'),
                    $discussionInput = $discussionForm.next('.discussion-footer');
                $discussionForm.height($context.height() - $discussionInput.outerHeight(true));
            } else {
                var classes = chApp.getOptions().classes,
                    $header = $context.find('.' + classes.headerSection),
                    $filters = $context.find('.' + classes.filterSection),
                    $container = $context.find('.' + classes.gridSection),
                    formSectionHeight = $context.height() - $header.outerHeight(true) - $filters.outerHeight(true);
                $container.height(formSectionHeight);

                var $form = $container.children('form'),
                    $footer = $container.children('footer'),
                    formHeight = formSectionHeight - $footer.outerHeight(true);
                $form.height(formHeight);

                var $menu = $form.find('.menu'),
                    $formSection = $form.children('section'),
                    formSectionHgt = formHeight - $menu.outerHeight(true);
                $formSection.height(formSectionHgt);
                if ($formSection.attr('data-id') === 'map') {
                    var map = facade.getFactoryModule().makeChMap($formSection.children('.map'));
                    map.map.container.fitToViewport();
                } else {
                    var $userGrid = $formSection.find('.grid-view');
                    $userGrid.height(formSectionHgt);
                }
            }
        };
        /**
         * @returns {ChocolateDraw}
         */
        this.reflowActiveTab = function () {
            return context.reflowTab(facade.getTabsModule().getActiveChTab());
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
         * @returns {ChocolateDraw}
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
         * @returns {ChocolateDraw}
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
                var activeTabClass = chApp.getOptions().classes.activeTab,
                    cardTab = facade.getFactoryModule().makeChTab($cont.find('.' +activeTabClass).children('a'));
                if (context._isNeedReflow(cardTab)) {
                    var $panel = cardTab.getPanel();
                    context
                        .drawCardPanel($panel, $cont)
                        .drawCardControls(cardTab.getCardContent());
                    $panel.find('.card-grid').each(function () {
                        var $cardCol = $(this).parent();
                        context.drawCardGrid($cardCol);
                        $cardCol.find('.grid-view').find('table').floatThead('reflow');
                    });
                    context._addTabToCache(cardTab);
                }
            } else {
                if (context._isNeedReflow(tab)) {
                    $cont = tab.getPanel();
                    context.drawGrid($cont);
                    $cont.find('.grid-view').find('table').floatThead('reflow');
                    var $form = $cont.children('section').children('form');
                    if (context._isDiscussionForm($form)) {
                        var $footer = $form.next('.discussion-footer');
                        $form.height($cont.height() - $footer.outerHeight(true));
                    }
                    context._addTabToCache(tab);
                }
            }
            return context;
        };
        /**
         * @param $cardCol {jQuery}
         */
        this.drawCardGrid = function ($cardCol) {
            var $cardGrid = $cardCol.find('.card-grid'),
                cardGridHeight = $cardGrid.height(),
                $section = $cardGrid.children('section');
            $section.height(cardGridHeight);
            context._layoutForm($section);
        };

        /**
         * Полностью рисует сетку, расположенную не в карточке. Можно использовать при ресайзинге.
         * @param $context {jQuery}
         */
        this.drawGrid = function ($context) {
            var $cardTabs = $context.parent();
            if ($cardTabs.attr('data-id') !== 'grid-tabs') {
                context._setTabHeight($context);
                context._layoutForm($context);
            }
        };
        /**
         * @param $context {jQuery}
         * @returns {ChocolateDraw}
         */
        this.drawCard = function ($context) {
            context._setTabHeight($context);
            var $header = $context.children('header'),
                $content = $context.children('div[data-id=grid-tabs]'),
                contentHeight = $context.height() - $header.outerHeight(true);
            $content.height(contentHeight);
            return context;
        };
        /**
         * @param $panel {jQuery}
         * @param $context {jQuery}
         * @returns {ChocolateDraw}
         */
        this.drawCardPanel = function ($panel, $context) {
            var $gridTabs = $context.children('[data-id=grid-tabs]'),
                $tabList = $gridTabs.children('ul'),
                MarginAndPaddingHgh = $panel.outerHeight(true) - $panel.height(),
                panelHeight = $gridTabs.height() - $tabList.outerHeight(true) - MarginAndPaddingHgh - 1;

            $panel.height(panelHeight);
            return context;
        };
        /**
         * Рисует контролы в карточке. Точнее отрисовывает контейнер в котором они лежат.
         * @param $card {jQuery}
         */
        this.drawCardControls = function ($card) {
            context._setDefaultControlsHeight($card);
            context._setCardControlsHeight($card);
        };
        this._setDefaultControlsHeight = function ($card) {
            var $container = $card.parent(),
                buttonHeight = 25,
                cardHeight = $container.height() - buttonHeight - 10;
            $card.height(cardHeight);
            var $buttons = $container.children('.card-action-button');
            $buttons.height(buttonHeight);
        };
        /**
         * @param $card {jQuery}
         */
        this._setCardControlsHeight = function ($card) {
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
                            minRowsHeight[curRowIndex] = rowHeight[curRowIndex];
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

    }
var context = new ChocolateDraw();
    return {
        reflowGrid: function($cnt){
            context.drawGrid($cnt);
        },
        reflowCard: function($cnt){
            context.drawCard($cnt);
        },
        reflowCardGrid: function($cardCol){
          context.drawCardGrid($cardCol);
        },
        reflowCardPanel: function($panel, $cnt){
            context.drawCardPanel($panel, $cnt);
        },
        reflowActiveTab: function(){
            context.reflowActiveTab();
        },
        clearCache: function(){
            context.clearTabsCache();
        }
    };
})();