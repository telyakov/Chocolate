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
             * @param {jQuery} $a
             * @returns {boolean}
             */
            isNeedReflow: function ($a) {
                var id = _private.getTabID($a);
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
            /**
             *
             * @param {jQuery} $a
             * @returns {string}
             */
            getTabID: function ($a) {
                return $a.attr('id');
            },
            /**
             *
             * @param {jQuery} $a
             * @returns {boolean}
             */
            isCardPanel: function ($a) {
                return _private.getPanel($a).hasClass(optionsModule.getClass('card'));
            },
            /**
             *
             * @param {jQuery} $a
             * @returns {jQuery}
             */
            getPanel: function ($a) {
                return $('#' + _private.getPanelID($a));
            },
            /**
             *
             * @param {jQuery} $a
             * @returns {String}
             */
            getPanelID: function ($a) {
                return $a.parent().attr('aria-controls');
            },
            /**
             *
             * @param {jQuery} $tab
             * @returns {jQuery}
             */
            getCardContent: function ($tab) {
                return _private.getPanel($tab).find('.card-content');
            },
            /**
             * @param {jQuery} $a
             * @param {boolean} force
             */
            reflowTab: function ($a, force) {
                var $context;
                if (_private.isCardPanel($a)) {
                    $context = _private.getPanel($a);
                    if (force || _private.isNeedReflow($a)) {
                        _private
                            .drawCard($context)
                            .addTabToCache(_private.getTabID($a));
                    }
                    var activeTabClass = optionsModule.getClass('activeTab'),
                        $cardA = $context.find('.' + activeTabClass).children('a');

                    if (force || _private.isNeedReflow($cardA)) {
                        var $panel = _private.getPanel($cardA);
                        _private
                            .drawCardPanel($panel, $context)
                            .drawCardControls(_private.getCardContent($cardA));

                        $panel.find('.card-grid')
                            .each(function () {
                                var $cardCol = $(this).parent();
                                _private.drawCardGrid($cardCol);
                                $cardCol.find('.grid-view').find('table').floatThead('reflow');
                            });
                        _private.addTabToCache(_private.getTabID($cardA));
                    }
                } else {
                    if (force || _private.isNeedReflow($a)) {
                        $context = _private.getPanel($a);
                        _private.drawGrid($context);
                        $context.find('.grid-view').find('table').floatThead('reflow');

                        var $form = $context.children('section').children('form');
                        if (_private.isDiscussionForm($form)) {
                            var $footer = $form.next('.discussion-footer');
                            $form.height($context.height() - $footer.outerHeight(true));
                        }
                        _private.addTabToCache(_private.getTabID($a));
                    }
                }
            },

            /**
             *
             * @param {jQuery} $cardColumn
             */
            drawCardGrid: function ($cardColumn) {
                var $cardGrid = $cardColumn.find('.card-grid'),
                    cardGridHeight = $cardGrid.height(),
                    $section = $cardGrid.children('section');
                $section.height(cardGridHeight);
                _private.layoutForm($section);
            },

            /**
             * @param {jQuery} $context
             * @desc Полностью рисует сетку, расположенную не в карточке. Можно использовать при ресайзинге.
             */
            drawGrid: function ($context) {
                var $cardTabs = $context.parent();
                if ($cardTabs.attr('data-id') !== 'grid-tabs') {
                    _private.setTabHeight($context);
                    _private.layoutForm($context);
                }
            },
            /**
             *
             * @param {jQuery} $context
             * @returns {*}
             */
            drawCard: function ($context) {
                _private.setTabHeight($context);
                var $header = $context.children('header'),
                    $content = $context.children('[data-id=grid-tabs]'),
                    contentHeight = $context.height() - $header.outerHeight(true);
                $content.height(contentHeight);
                return _private;
            },
            /**
             *
             * @param {jQuery} $panel
             * @param {jQuery} $context
             * @returns {*}
             */
            drawCardPanel: function ($panel, $context) {
                var $gridTabs = $context.children('[data-id=grid-tabs]'),
                    $tabList = $gridTabs.children('ul'),
                    MarginAndPaddingHgh = $panel.outerHeight(true) - $panel.height(),
                    panelHeight = $gridTabs.height() - $tabList.outerHeight(true) - MarginAndPaddingHgh - 1;

                $panel.height(panelHeight);
                return _private;
            },
            /**
             * @param {jQuery} $card
             * @desc Рисует контролы в карточке. Точнее отрисовывает контейнер в котором они лежат.
             */
            drawCardControls: function ($card) {
                _private.computeCardHeight($card);
                _private.computeCardControlsHeight($card);
            },
            /**
             * @param {jQuery} $card
             */
            computeCardHeight: function ($card) {
                var $container = $card.parent(),
                    $buttons = $container.children('.card-action-button'),
                    cardHeight = $container.height() - $buttons.height() - 10;

                $card.height(cardHeight);
            },
            /**
             * @param {jQuery} $card
             */
            computeCardControlsHeight: function ($card) {
                var staticRows = [],
                    rowsCount = parseInt($card.attr('data-rows'), 10),
                    cardHeight = $card.height(),
                    dynamicRowHeight = parseInt(cardHeight / rowsCount, 10),
                    rowHeight = [],
                    minRowsHeight = [],
                    $cols = $card.children('.card-col'),
                    staticClass = optionsModule.getClass('staticCardElement'),
                    colsLength = $cols.length;

                for (var iterator = 0; iterator < colsLength; iterator += 1) {
                    var col = $cols[iterator],
                        startRow = parseInt(col.getAttribute('data-y'), 10),
                        colRowCount = parseInt(col.getAttribute('data-rows'), 10),
                        isStatic = $(col).hasClass(staticClass),
                        minHeight = parseInt(col.getAttribute('data-min-height'), 10),
                        i = 0;
                    while (i < colRowCount) {
                        var curRowIndex = startRow + i;
                        if (isStatic) {
                            if (staticRows.indexOf(curRowIndex) === -1) {
                                staticRows.push(curRowIndex);
                                rowHeight[curRowIndex] = minHeight + 5;
                                minRowsHeight[curRowIndex] = rowHeight[curRowIndex];
                            }
                        } else if (rowHeight[curRowIndex] === undefined) {

                            rowHeight[curRowIndex] = dynamicRowHeight;
                            minRowsHeight[curRowIndex] = minHeight / colRowCount;
                        } else {

                            minRowsHeight[curRowIndex] = Math.max(minHeight / colRowCount, minRowsHeight[curRowIndex]);
                        }
                        i += 1;
                    }
                }
                var actualHeight = [],
                    cardMinHeight = 0,
                    k = 1;
                while (k <= rowsCount) {
                    var minH = parseInt(minRowsHeight[k], 10),
                        realH = parseInt(rowHeight[k], 10);
                    if (minH) {
                        cardMinHeight += minH;
                    } else {
                        minH = 0;
                    }
                    if (!realH) {
                        realH = 0;
                    }
                    actualHeight.push(Math.max(minH, realH));
                    k += 1;
                }
                _private.applyCssToCardElements($cols, $card, actualHeight);
            },
            /**
             *
             * @param {jQuery} $cols
             * @param {jQuery} $card
             * @param {Array} actualHeights
             */
            applyCssToCardElements: function ($cols, $card, actualHeights) {
                for (var iterator = 0, colsLength = $cols.length; iterator < colsLength; iterator += 1) {
                    var column = $cols[iterator],
                        $col = $(column),
                        dataY = parseInt(column.getAttribute('data-y'), 10),
                        countRow = parseInt(column.getAttribute('data-rows'), 10);

                    var preparePositionY = dataY - 1,
                        heightArray = actualHeights.slice(preparePositionY, countRow + preparePositionY),
                        height = 0;

                    var i, n;
                    for (i = 0, n = heightArray.length; i < n; i += 1) {
                        height += heightArray[i];
                    }

                    var sumArray = actualHeights.slice(0, preparePositionY),
                        sum = 0;
                    for (i = 0, n = sumArray.length; i < n; i += 1) {
                        sum += sumArray[i];
                    }

                    var $input = $col.children('.card-input');
                    if ($col.hasClass('card-static')) {
                        $input.height(21);
                    }
                    else if ($input.hasClass('card-grid')) {
                        $input.height(height);
                    } else {
                        $input.height(height - 26);
                    }

                    $col.css({top: sum, height: height - 6});
                }
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