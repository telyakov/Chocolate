var ChocolateDraw = {
    reflowedTabs: [],
    reflowActiveTab: function () {
        ChocolateDraw.reflowTab(Chocolate.getActiveChTab());
    },
    /**
     * @param tab {ChTab}
     */
    _isNeedReflow: function (tab) {
        return ChocolateDraw.reflowedTabs.indexOf(tab.getID()) === -1;
    },
    /**
     * @param ch_tab {ChTab}
     */
    clearReflowedTab: function (ch_tab) {
        var index = this.reflowedTabs.indexOf(ch_tab.getID());
        if (index !== -1) {
            delete this.reflowedTabs[index];
        }

    },
    clearReflowedTabs: function () {
        this.reflowedTabs = [];
    },
    /**
     * @param tab {ChTab}
     */
    reflowTab: function (tab) {
        var $context;
        if (tab.isCardTypePanel()) {
            $context = tab.getPanel();
            if (this._isNeedReflow(tab)) {
                this.drawCard($context)
                this.reflowedTabs.push(tab.getID());
            }
            var ch_card_tab = ChObjectStorage.create($context.find(Chocolate.clsSel(ChOptions.classes.activeTab)).children('a'), 'ChTab');
            if (this._isNeedReflow(ch_card_tab)) {
                var $panel = ch_card_tab.getPanel(),
                    _this = this;
                this.drawCardPanel($panel, $context);
                this.drawCardControls(ch_card_tab.getCardContent());
                $panel.find('div.card-grid').each(function () {
                    var $card_col = $(this).parent();
                    _this.drawCardGrid($card_col)
                    $card_col.find('div[data-id=user-grid]').find('table').each(function () {
                        $(this).floatThead('reflow');
                    })
                })
                this.reflowedTabs.push(ch_card_tab.getID());
            }
        } else {
            if (this._isNeedReflow(tab)) {
                //Для сеток
                $context = tab.getPanel();
                this.drawGrid($context)
                $context.find('div[data-id=user-grid]').find('table').each(function () {
                    $(this).floatThead('reflow');
                })
                var $discussionForm = $context.children('section').children('form');
                if ($discussionForm.hasClass('discussion-form')) {
                    var $discussionInputSection = $discussionForm.next('.discussion-footer');
                    $discussionForm.height($context.height() - $discussionInputSection.outerHeight(true));

                }
                this.reflowedTabs.push(tab.getID());

            }
        }

    },
    _drawContent: function ($context) {
        var windows_height = Chocolate.$window.height(),
            header_height = Chocolate.$header.height(),
            footer_height = Chocolate.$footer.height(),
            pagewrap_height = windows_height - header_height - footer_height;

        $(Chocolate.$page, Chocolate.$content, Chocolate.$tabs).height(pagewrap_height);
        var $tab_list = Chocolate.$tabs.children('ul').eq(0),
            page_content_delta = $context.outerHeight() - $context.height(),
            page_content_height = pagewrap_height - $tab_list.outerHeight(true) - page_content_delta;

        $context.height(page_content_height);
        return page_content_height;
    },
    _drawGridForm: function ($context) {
        if ($context.children('form').hasClass('discussion-form')) {
            var $discussionForm = $context.children('form');
            var $discussionInputSection = $discussionForm.next('.discussion-footer');
            $discussionForm.height($context.height() - $discussionInputSection.outerHeight(true));

        } else {
        var $content_header = $context.find('section[data-id=header]'),
            $content_filters = $context.find('section[data-id=filters]'),
            $content_grid_form = $context.find('section[data-id=grid-form]'),
            content_grid_form_height = $context.height() - $content_header.outerHeight(true) - $content_filters.outerHeight(true);
        $content_grid_form.height(content_grid_form_height);

        var $form = $content_grid_form.children('form'),
            $footer = $content_grid_form.children('footer'),
            form_height = content_grid_form_height - $footer.outerHeight(true);


            $form.height(form_height);

            var $menu = $form.find('menu'),
                $grid_section = $form.children('section'),
                grid_section_height = form_height - $menu.outerHeight(true);
            $grid_section.height(grid_section_height);
            if ($grid_section.attr('data-id') == 'map') {
                var ch_map = ChObjectStorage.create($grid_section.children('.map'), 'ChMap');
                ch_map.map.container.fitToViewport();

            } else {


                var $user_grid = $grid_section.find('div[data-id=user-grid]');
                $user_grid.height(grid_section_height);
            }
        }
    },
    /**
     * Полностью рисует сетку, расположенную не в карточке. Можно использовать при ресайзинге.
     * @param $context
     */
    drawGrid: function ($context) {
        var $card_tabs = $context.parent()
        if ($card_tabs.attr('data-id') != 'grid-tabs') {
            /**
             * Перерисовываем внешние контейнеры
             */
            this._drawContent($context)
            /**
             *  Перерисовываем саму сетку.
             */
            this._drawGridForm($context)
        }
    },
    /**
     * Рисует когнтейнер карточки.
     * @param $context
     */
    drawCard: function ($context) {
        this._drawContent($context)
        var $header = $context.children('header'),
            $content = $context.children('div[data-id=grid-tabs]'),
            content_height = $context.height() - $header.outerHeight(true);
        $content.height(content_height)
    },
    /**
     * Рисует одну из панелей в карточке.
     */
    drawCardPanel: function ($panel, $context) {
        var $grid_tabs = $context.children('div[data-id=grid-tabs]'),
            $tab_list = $grid_tabs.children('ul'),
            delta_height = $panel.outerHeight(true) - $panel.height(),
            panel_height = $grid_tabs.height() - $tab_list.outerHeight(true) - delta_height - 1;

        $panel.height(panel_height);
    },
    /**
     * Рисует контролы в карточке. Точнее отрисовывает контейнер в котором они лежат.
     * @param $card_content
     */
    drawCardControls: function ($card_content) {
        var $container = $card_content.parent(),
            button_height = 25,
            card_height = $container.height() - button_height - 10;

        $card_content.height(card_height);
        var $card_action_buttons = $container.children('.card-action-button');
        $card_action_buttons.height(button_height);
        this.drawCardElements($card_content)
    },
    drawCardElements: function ($card) {
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
                    if (!~jQuery.inArray(curRowIndex, staticRows)) {
                        staticRows.push(curRowIndex);
                        rowHeight[curRowIndex] = minHeight + 5;
                        minRowsHeight[curRowIndex] = minHeight + 5;
                    }
                } else {
                    if (typeof rowHeight[curRowIndex] == 'undefined') {
                        rowHeight[curRowIndex] = dynamicRowHeight;
                        minRowsHeight[curRowIndex] = minHeight / colRowCount;
                    } else {
                        minRowsHeight[curRowIndex] = Math.max(minHeight / colRowCount, minRowsHeight[curRowIndex]);
                    }
                }
                i++;
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
            i++;
        }

        $cols.each(function (index, col) {
            var $col = $(col),
                dataY = parseInt($col.attr('data-y'), 10),
                countRow = parseInt($col.attr('data-rows'), 10);

            var height = actualHeight
                .filter(function (value, index) {
                    return (index + 1) >= dataY && (index + 1) < (countRow + dataY)
                })
                .reduce(function (previousStr, currentItem) {
                    return previousStr + currentItem;
                });
            $col.height(height - 6);
            var sum = actualHeight
                .filter(function (value, index) {
                    return index + 1 < dataY
                });
            if (sum.length > 0) {
                sum = sum.reduce(function (previousStr, currentItem) {
                    return previousStr + currentItem;
                })
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
    },
    /**
     * Рисуем сетку в карточке
     * @param $card_col
     */
    drawCardGrid: function ($card_col) {
        /**
         * Прорисовываем контейнер для сетки
         */
        var $card_grid = $card_col.find('div.card-grid'),
            card_grid_height = $card_grid.height(),
            $section = $card_grid.children('section');
        $section.height(card_grid_height)
        /**
         * Рисуем саму сетку.
         */
        this._drawGridForm($section)
    }

}