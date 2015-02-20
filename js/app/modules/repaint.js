var repaintModule = (function (undefined, $, optionsModule, Math, helpersModule) {
    'use strict';
    /**
     *
     * @type {String[]}
     */
    var cache = [],
        _private = {
            /**
             *
             * @param {jQuery} $context
             * @returns {number} - correct tab height
             */
            setTabHeight: function ($context) {
                var $tabs = helpersModule.getTabsObj(),
                    pageHeight = helpersModule.getWindowObj().height() - helpersModule.getHeaderObj().height() - 1;

                $(helpersModule.getPageObj(), helpersModule.getContentObj(), $tabs).height(pageHeight);

                var menuHeight = $tabs.children('ul').outerHeight(true),
                    pagePaddingHgh = $context.outerHeight() - $context.height(),
                    correctPageHgh = pageHeight - menuHeight - pagePaddingHgh;

                $context.height(correctPageHgh);
                return correctPageHgh;
            },
            /**
             *  @param {jQuery} $form
             * @returns {boolean}
             */
            isDiscussionForm: function ($form) {
                return $form.hasClass(optionsModule.getClass('discussionForm'));
            },
            /**
             *
             * @param {jQuery} $context
             */
            layoutForm: function ($context) {
                if (_private.isDiscussionForm($context.children('form'))) {
                    var $discussionForm = $context.children('form'),
                        $discussionInput = $discussionForm.next('.discussion-footer');
                    $discussionForm.height($context.height() - $discussionInput.outerHeight(true));
                } else {
                    var $header = $context.find('.' + optionsModule.getClass('headerSection')),
                        $filters = $context.find('.' + optionsModule.getClass('filterSection')),
                        $container = $context.find('.' + optionsModule.getClass('gridSection')),
                        containerHeight = $context.height() - $header.outerHeight(true) - $filters.outerHeight(true);
                    $container.height(containerHeight);

                    var $form = $container.children('form'),
                        $footer = $container.children('footer'),
                        formHeight = containerHeight - $footer.outerHeight(true);
                    $form.height(formHeight);

                    var $menu = $form.find('.menu'),
                        $formSection = $form.children('section'),
                        formSectionHeight = formHeight - $menu.outerHeight(true);
                    $formSection.height(formSectionHeight);

                    if ($formSection.attr('data-id') !== 'map') {
                        var $userGrid = $formSection.find('.grid-view');
                        $userGrid.height(formSectionHeight);
                    }
                }
            },
            /**
             * @param {boolean} force
             */
            reflowActiveTab: function (force) {
                _private.reflowTab(facade.getTabsModule().getActiveTab(), force);
            },
            /**
             * @param {String} id
             * @returns {boolean}
             */
            isNeedReflow: function (id) {
                return cache.indexOf(id) === -1;
            },
            /**
             * @desc delete from cache al painting tabs
             */
            clearTabsCache: function () {
                cache = [];
            },
            /**
             * @param {String} id
             */
            addTabToCache: function (id) {
                cache.push(id);
            },
            getID: function ($tab) {
                return $tab.attr('id');
            },
            getLi: function ($tab) {
                return $tab.parent();
            },
            isCardTypePanel: function ($tab) {
                return _private.getPanel($tab).hasClass(facade.getOptionsModule().getClass('card'));
            },
            getPanel: function ($tab) {
                return $('#' + _private.getPanelID($tab));
            },
            getPanelID: function ($tab) {
                return _private.getLi($tab).attr('aria-controls');
            },
            getCardContent: function ($tab) {
                    return _private.getPanel($tab).find('.card-content');
            },
            /**
             * @param {jQuery} $tab
             * @param {boolean} force
             */
            reflowTab: function ($tab, force) {
                var $cont;
                if (_private.isCardTypePanel($tab)) {
                    $cont = _private.getPanel($tab);
                    if (force || _private.isNeedReflow(_private.getID($tab))) {
                        _private
                            .drawCard($cont)
                            .addTabToCache(_private.getID($tab));
                    }
                    var activeTabClass = optionsModule.getClass('activeTab'),
                        $cardTab = $cont.find('.' + activeTabClass).children('a');
                    if (force || _private.isNeedReflow(_private.getID($cardTab))) {
                        var $panel = _private.getPanel($cardTab);
                        _private
                            .drawCardPanel($panel, $cont)
                            .drawCardControls(_private.getCardContent($cardTab));
                        $panel.find('.card-grid').each(function () {
                            var $cardCol = $(this).parent();
                            _private.drawCardGrid($cardCol);
                            $cardCol.find('.grid-view').find('table').floatThead('reflow');
                        });
                        _private.addTabToCache(_private.getID($cardTab));
                    }
                } else {
                    if (force || _private.isNeedReflow(_private.getID($tab))) {
                        $cont = _private.getPanel($tab);
                        _private.drawGrid($cont);
                        $cont.find('.grid-view').find('table').floatThead('reflow');
                        var $form = $cont.children('section').children('form');
                        if (_private.isDiscussionForm($form)) {
                            var $footer = $form.next('.discussion-footer');
                            $form.height($cont.height() - $footer.outerHeight(true));
                        }
                        _private.addTabToCache(_private.getID($tab));
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

        /**
         *
         * @param {Boolean} [force=false]
         */
        reflowActiveTab: function (force) {
            if (force === undefined) {
                force = false;
            }
            _private.reflowActiveTab(force);
        },
        /**
         * @desc delete from cache al painting tabs
         */
        clearCache: function () {
            _private.clearTabsCache();
        }
    };
})(undefined, jQuery, optionsModule, Math, helpersModule);