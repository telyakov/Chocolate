var cardModule = (function ($, optionsModule, helpersModule, repaintModule, factoryModule) {
    'use strict';
    var callbacks = $.Callbacks(''),
        _private = {
            fireOnceCallback: function ($cnt) {
                callbacks.fire($cnt);
                _private.clearCallbacks();
            },
            clearCallbacks: function () {
                callbacks.empty();
            },
            /**
             * @param fn {function}
             */
            addCallback: function (fn) {
                callbacks.add(fn);
            },
            initScripts: function (ui, content, $context) {
                ui.panel.html(content);
                _private.fireOnceCallback(ui.panel);
                repaintModule.reflowCardPanel(ui.panel, $context);
                setTimeout(function () {
                    mediator.publish(optionsModule.getChannel('reflowTab'));
                }, 0);
                ui.tab.data('loaded', 1);
            },
            /**
             * @param e {Event}
             * @param ui {Object}
             * @param $tabPanel {jQuery}
             * @param $this {jQuery}
             * @returns {boolean}
             */
            beforeLoad: function (e, ui, $tabPanel, $this) {
                if (!ui.tab.data('loaded')) {
                    //var chCard = factoryModule.makeChCard($this),
                    //    tabID = $(ui.tab).attr('data-id'),
                    //    pk = chCard.getKey(),
                    //    fmCardCollection = chCard.getFmCardCollection(),
                    //    isNumeric = $.isNumeric(pk),
                    //    template = fmCardCollection.getCardTemplate(tabID, isNumeric);
                    console.log(e, ui, $tabPanel, $this);
                    //if (template === null) {
                    //    $.get(chCard.getTabDataUrl(tabID))
                    //        .done(function (template) {
                    //            var $content = $(helpersModule.layoutTemplate(template, pk));
                    //            try {
                    //                _private.initScripts(ui, $content, $tabPanel);
                    //                fmCardCollection.setCardTemplate(tabID, template, isNumeric);
                    //            } catch (e) {
                    //                $content.remove();
                    //                mediator.publish(optionsModule.getChannel('logError'),
                    //                    'Возникла ошибка при инициализации шаблона',
                    //                    e
                    //                );
                    //            }
                    //        })
                    //        .fail(function (e) {
                    //            mediator.publish(optionsModule.getChannel('logError'),
                    //                'Ошибка при получении с сервера шаблон закладки для карточки',
                    //                e
                    //            );
                    //        });
                    //} else {
                    //    _private.initScripts(ui, helpersModule.layoutTemplate(template, pk), $tabPanel);
                    //}
                }
                return false;
            },
            init: function ($panel) {
                $panel
                    .addClass(optionsModule.getClass('card'))
                    .children('div').tabs({
                        beforeLoad: function (e, ui) {
                            return _private.beforeLoad(e, ui, $panel, $(this));
                        },
                        cache: true
                    });
            }
        };
    return {
        addCallback: function (fn) {
            _private.addCallback(fn);
        },
        fireOnceCallback: function ($cnt) {
            _private.fireOnceCallback($cnt);
        },
        initCard: function ($cnt) {
            _private.init($cnt);
        }
    };
})(jQuery, optionsModule, helpersModule, repaintModule, factoryModule);