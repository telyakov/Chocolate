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
        createSqlTasks: function (cards, idList, pk) {
            if (this.isVisibleCaption(cards)) {
                var entityTypeID = this.model.getEntityTypeID();
                cards.each(function (card) {
                    var defer = deferredModule.create(),
                        deferID = deferredModule.save(defer),
                        sql = card.getCaptionReadProc(),
                        data = {
                            parentid: pk,
                            entityid: pk,
                            entitytypeid: entityTypeID,
                            entitytype: entityTypeID
                        };
                    if (sql) {
                        bindModule.deferredBindSql(deferID, sql, data);
                        defer.done(function (res) {
                            var prepareSql = res.sql;
                            mediator.publish(facade.getOptionsModule().getChannel('socketRequest'), {
                                type: 'jquery',
                                query: prepareSql,
                                id: idList[card.getKey()]
                            });
                        });
                    }
                });
            }
        },
        isVisibleCaption: function (cards) {
            return cards.length > 1;
        },
        generateList: function (view, pk, viewID, $panel) {

            var html = '<div data-id="grid-tabs"' +
                'data-view="' + view + '"' +
                'data-pk="' + pk + '"' + 'data-form-id="' + viewID + '"' +
                'data-save-url="/grid/save?view=' + view + '">';
            var cards = this.model.getCardROCollection();
            var isVisibleCaption = this.isVisibleCaption(cards);
            if (isVisibleCaption) {
                html += '<ul>';
            } else {
                html += '<ul class="hidden">';
            }
            var tabs = [];
            var tabIdList = {};
            cards.each(function (card) {
                var key = card.getKey();
                html += ' <li class="card-tab" data-id="' + key + '"';
                var id = helpersModule.uniqueID();
                html += ' aria-controls="' + id + '">';
                var tabID = helpersModule.uniqueID();
                tabIdList[key] = tabID;
                html += '<a id="' + tabID + '" href="1" title="' + key + '">' + card.getCaption() + '</a>';
            });
            html += '</ul>';
            if (isVisibleCaption) {
                html += '<span class="tab-menu"><a class="tab-menu-link"></a></span>';
            }
            html += '</div>';
            $panel.append(html);

            if ($.isNumeric(pk)) {
                this.createSqlTasks(cards, tabIdList, pk);
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
                    isNumeric = $.isNumeric(pk);
                var card = this.model.getCardROCollection().findWhere({
                    key: tabID
                });
                this.createPanel(card);
                //console.log(e, ui, $tabPanel, $this, $(ui.tab));
                //$.get(chCard.getTabDataUrl(tabID))
                //    .done(function (template) {
                //        var $content = $(helpersModule.layoutTemplate(template, pk));
                //        try {
                //            _private.initScripts(ui, $content, $tabPanel);
                //            fmCardCollection.setCardTemplate(tabID, template, isNumeric);
                //        } catch (e) {
                //            $content.remove();
                //            mediator.publish(optionsModule.getChannel('logError'),
                //                'Возникла ошибка при инициализации шаблона',
                //                e
                //            );
                //        }
                //    })
                //    .fail(function (e) {
                //        mediator.publish(optionsModule.getChannel('logError'),
                //            'Ошибка при получении с сервера шаблон закладки для карточки',
                //            e
                //        );
                //    });

            }
            return false;
        },
        createPanel: function (card) {
            var startYPos = 1,
                maxPos = 'max',
                tabIndex = 0,
                cellWidth = parseInt(100/card.getCols(), 10),
            html = [];
            var elements =  this.model.getCardElements(card);
            var sortedElements = _.sortBy(elements,function(model){
                return model.getCardX();
                //console.log(model.getCardX(), model.getCardY());
            });
            console.log(sortedElements)

        }
    });
})(Backbone, jQuery);