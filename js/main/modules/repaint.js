var repaintModule = (function (undefined, $, optionsModule, factoryModule, Math, helpersModule) {
    'use strict';
    var cache = [],
        _private = {
            /**
             * @returns {int}
             */
            setTabHeight: function ($context) {
                var $tabs = helpersModule.getTabsObj(),
                    windowsHgh = helpersModule.getWindowObj().height(),
                    headerHgh = helpersModule.getHeaderObj().height(),
                    footerHgh = helpersModule.getFooterObj().height(),
                    pageHgh = windowsHgh - headerHgh - footerHgh;
                $(helpersModule.getPageObj(), helpersModule.getContentObj(), $tabs).height(pageHgh);
                var $tabItems = $tabs.children('ul').eq(0),
                    pagePaddingHgh = $context.outerHeight() - $context.height(),
                    correctPageHgh = pageHgh - $tabItems.outerHeight(true) - pagePaddingHgh;
                $context.height(correctPageHgh);
                return correctPageHgh;
            },
            /**
             * @returns {boolean}
             */
            isDiscussionForm: function ($form) {
                return $form.hasClass(optionsModule.getClass('discussionForm'));
            },
            layoutForm: function ($context) {
                if (_private.isDiscussionForm($context.children('form'))) {
                    var $discussionForm = $context.children('form'),
                        $discussionInput = $discussionForm.next('.discussion-footer');
                    $discussionForm.height($context.height() - $discussionInput.outerHeight(true));
                } else {
                    var $header = $context.find('.' + optionsModule.getClass('headerSection')),
                        $filters = $context.find('.' + optionsModule.getClass('filterSection')),
                        $container = $context.find('.' + optionsModule.getClass('gridSection')),
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
                        var map = factoryModule.makeChMap($formSection.children('.map'));
                        map.map.container.fitToViewport();
                    } else {
                        var $userGrid = $formSection.find('.grid-view');
                        $userGrid.height(formSectionHgt);
                    }
                }
            },
            /**
             * @param force {boolean}
             */
            reflowActiveTab: function (force) {
                return _private.reflowTab(facade.getTabsModule().getActiveChTab(), force);
            },
            /**
             * @param tab {ChTab}
             * @returns {boolean}
             */
            isNeedReflow: function (tab) {
                return cache.indexOf(tab.getID()) === -1;
            },

            clearTabsCache: function () {
                cache = [];
                return _private;
            },
            /**
             * @param tab {ChTab}
             */
            addTabToCache: function (tab) {
                cache.push(tab.getID());
            },
            /**
             * @param tab {ChTab}
             * @param force {boolean}
             */
            reflowTab: function (tab, force) {
                var $cont;
                if (tab.isCardTypePanel()) {
                    $cont = tab.getPanel();
                    if (force || _private.isNeedReflow(tab)) {
                        _private
                            .drawCard($cont)
                            .addTabToCache(tab);
                    }
                    var activeTabClass = optionsModule.getClass('activeTab'),
                        cardTab = factoryModule.makeChTab($cont.find('.' + activeTabClass).children('a'));
                    if (force || _private.isNeedReflow(cardTab)) {
                        var $panel = cardTab.getPanel();
                        _private
                            .drawCardPanel($panel, $cont)
                            .drawCardControls(cardTab.getCardContent());
                        $panel.find('.card-grid').each(function () {
                            var $cardCol = $(this).parent();
                            _private.drawCardGrid($cardCol);
                            $cardCol.find('.grid-view').find('table').floatThead('reflow');
                        });
                        _private.addTabToCache(cardTab);
                    }
                } else {
                    if (force || _private.isNeedReflow(tab)) {
                        $cont = tab.getPanel();
                        _private.drawGrid($cont);
                        $cont.find('.grid-view').find('table').floatThead('reflow');
                        var $form = $cont.children('section').children('form');
                        if (_private.isDiscussionForm($form)) {
                            var $footer = $form.next('.discussion-footer');
                            $form.height($cont.height() - $footer.outerHeight(true));
                        }
                        _private.addTabToCache(tab);
                    }
                }
                return _private;
            },
            drawCardGrid: function ($cardCol) {
                var $cardGrid = $cardCol.find('.card-grid'),
                    cardGridHeight = $cardGrid.height(),
                    $section = $cardGrid.children('section');
                $section.height(cardGridHeight);
                _private.layoutForm($section);
            },

            /**
             * Полностью рисует сетку, расположенную не в карточке. Можно использовать при ресайзинге.
             */
            drawGrid: function ($context) {
                var $cardTabs = $context.parent();
                if ($cardTabs.attr('data-id') !== 'grid-tabs') {
                    _private.setTabHeight($context);
                    _private.layoutForm($context);
                }
            },
            drawCard: function ($context) {
                _private.setTabHeight($context);
                var $header = $context.children('header'),
                    $content = $context.children('div[data-id=grid-tabs]'),
                    contentHeight = $context.height() - $header.outerHeight(true);
                $content.height(contentHeight);
                return _private;
            },
            drawCardPanel: function ($panel, $context) {
                var $gridTabs = $context.children('[data-id=grid-tabs]'),
                    $tabList = $gridTabs.children('ul'),
                    MarginAndPaddingHgh = $panel.outerHeight(true) - $panel.height(),
                    panelHeight = $gridTabs.height() - $tabList.outerHeight(true) - MarginAndPaddingHgh - 1;

                $panel.height(panelHeight);
                return _private;
            },
            /**
             * Рисует контролы в карточке. Точнее отрисовывает контейнер в котором они лежат.
             */
            drawCardControls: function ($card) {
                _private.setDefaultControlsHeight($card);
                _private.setCardControlsHeight($card);
            },
            setDefaultControlsHeight: function ($card) {
                var $container = $card.parent(),
                    buttonHeight = 25,
                    cardHeight = $container.height() - buttonHeight - 10;
                $card.height(cardHeight);
                var $buttons = $container.children('.card-action-button');
                $buttons.height(buttonHeight);
            },
            setCardControlsHeight: function ($card) {
                var staticRows = [],
                    rowsCount = parseInt($card.attr('data-rows'), 10),
                    cardHeight = $card.height(),
                    dynamicRowHeight = parseInt(cardHeight / rowsCount, 10),
                    rowHeight = [],
                    minRowsHeight = [],
                    $cols = $card.find('.card-col'),
                    staticClass = optionsModule.getClass('staticCardElement');

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
                            if ($.inArray(curRowIndex, staticRows) === -1) {
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
            }
        };
    return {
        reflowGrid: function ($cnt) {
            _private.drawGrid($cnt);
        },
        reflowCard: function ($cnt) {
            _private.drawCard($cnt);
        },
        reflowCardGrid: function ($cardCol) {
            _private.drawCardGrid($cardCol);
        },
        reflowCardPanel: function ($panel, $cnt) {
            _private.drawCardPanel($panel, $cnt);
        },
        reflowActiveTab: function (force) {
            if (force === undefined) {
                force = false;
            }
            _private.reflowActiveTab(force);
        },
        clearCache: function () {
            _private.clearTabsCache();
        }
    };
})(undefined, jQuery, optionsModule, factoryModule, Math, helpersModule);