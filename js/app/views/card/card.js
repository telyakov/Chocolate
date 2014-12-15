var CardView = (function (Backbone, $) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.model = options.model;
            //this.form = options.form;
            this.id = options.id;
            if (options.$el) {
                this.$el = options.$el;
            }
        },
        render: function (view, pk, viewID, $panel) {
            $panel.html(this.generateHeader(view));
            this.generateList(view, pk, viewID, $panel);

        },
        generateHeader: function () {
            var view = this.model.getView();
            var html = [
                '<header class="card-header">',
                '<div class="card-bottom-header card-error"></div>'
            ];
            var $image = imageAdapter.convert(this.model.getCardHeaderImage()),
                image = $image.wrapAll('<div></div>').parent().html();
            if (this.model.hasCardHeader()) {
                html.push('<div class="card-top-header"><div class="card-header-left">');
                html.push(image);
                html.push('</div><div class="card-header-right">');
                html.push(this.model.getCardHeaderText());
                html.push('</div></div>');
            }
            if (chApp.getOptions().settings.topsViews.indexOf(view) !== -1) {
                html.push('<menu class="menu"><button class="active menu-button card-menu-save"><span class="fa-save"></span><span>Сохранить</span></button></menu>');
            }
            html.push('</header>');
            return html.join('');
        },
        createSqlTasks: function (card, idList) {
            if (this.isVisibleCaptions()) {
                for (var key in this.cards) {
                    if (this.cards.hasOwnProperty(key)) {
                        var sql = jQuery.trim(this.cards[key].captionReadProc);
                        if (sql) {
                            sql = facade.getBindModule().bindCardSql(sql, card);

                            var channel = facade.getOptionsModule().getChannel('socketRequest');
                            mediator.publish(channel, {
                                type: 'jquery',
                                query: sql,
                                id: idList[key]
                            });
                        }
                    }
                }
            }
        },
        isVisibleCaptions: function () {
            return Object.keys(this.model.getCardCollection()).length > 1;
        },
        generateList: function (view, pk, viewID, $panel) {

            var html = '<div data-id="grid-tabs"' +
                'data-view="' + view + '"' +
                'data-pk="' + pk + '"' + 'data-form-id="' + viewID + '"' +
                'data-save-url="/grid/save?view=' + view + '">';
            var isVisibleCaption = this.isVisibleCaptions();
            if (isVisibleCaption) {
                html += '<ul>';
            } else {
                html += '<ul class="hidden">';
            }
            var tabs = [];
            var tabIdList = {};
            var cards = this.model.getCardCollection();
            cards.each(function (card) {
                if (helpersModule.boolEval(card.getVisible(), true)) {
                    var key = card.getKey();
                    html += ' <li class="card-tab" data-id="' + key + '"';
                    var id = helpersModule.uniqueID();
                    html += ' aria-controls="' + id + '">';
                    var tabID = helpersModule.uniqueID();
                    tabIdList[key] = tabID;
                    html += '<a id="' + tabID + '" href="1" title="' + key + '">' + card.getCaption() + '</a>';
                }
            });
            html += '</ul>';
            if (isVisibleCaption) {
                html += '<span class="tab-menu"><a class="tab-menu-link"></a></span>';
            }
            html += '</div>';
            $panel.append(html);

            var card = facade.getFactoryModule().makeChCard($panel.children('[data-id=grid-tabs]'));
            if ($.isNumeric(pk)) {
                this.createSqlTasks(card, tabIdList);
            }

        },
        initScripts: function ($cnt) {
            var _this = this;
            $cnt
                .addClass(optionsModule.getClass('card'))
                .children('div').tabs({
                    beforeLoad: function (e, ui) {
                        return _this.beforeLoad(e, ui, $cnt, $(this));
                    },
                    cache: true
                });
        },
        beforeLoad: function (e, ui, $tabPanel, $this) {
            if (!ui.tab.data('loaded')) {
                var chCard = factoryModule.makeChCard($this),
                    tabID = $(ui.tab).attr('data-id'),
                    pk = chCard.getKey(),
                    fmCardCollection = chCard.getFmCardCollection(),
                    isNumeric = $.isNumeric(pk);
                console.log(e, ui, $tabPanel, $this);
                $.get(chCard.getTabDataUrl(tabID))
                    .done(function (template) {
                        var $content = $(helpersModule.layoutTemplate(template, pk));
                        try {
                            _private.initScripts(ui, $content, $tabPanel);
                            fmCardCollection.setCardTemplate(tabID, template, isNumeric);
                        } catch (e) {
                            $content.remove();
                            mediator.publish(optionsModule.getChannel('logError'),
                                'Возникла ошибка при инициализации шаблона',
                                e
                            );
                        }
                    })
                    .fail(function (e) {
                        mediator.publish(optionsModule.getChannel('logError'),
                            'Ошибка при получении с сервера шаблон закладки для карточки',
                            e
                        );
                    });

            }
            return false;
        }
    });
})(Backbone, jQuery);