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
        events: {
            'keydown .card-input a': 'keyActionsCardHandler',
            'click .tab-menu-link': 'openCardTabMenuHandler'
        },
        keyActionsCardHandler: function (e) {
            if (e.keyCode === optionsModule.getKeyCode('enter')) {
                var $this = $(e.target), $modalBtn = $this.next('.grid-modal-open');
                if ($modalBtn.length) {
                    $modalBtn.triggerHandler('click');
                } else {
                    $this.triggerHandler('click');
                }
                return false;
            }
        },
        openCardTabMenuHandler: function (e) {
            var $this = $(e.target),
                $tabs = $this.closest('.tab-menu').prevAll('.ui-tabs-nav').find('a'),
                menu = [],
                activeClass = chApp.getOptions().classes.activeTab;
            $tabs.each(function () {
                var item = {
                    title: $(this).text(),
                    cmd: $(this).attr('id')
                };
                if ($(this).parent().hasClass(activeClass)) {
                    item.uiIcon = 'ui-icon-check';
                }
                menu.push(item);
            });
            $this.contextmenu({
                show: {effect: "blind", duration: 0},
                menu: menu,
                select: function (event, ui) {
                    $('#' + ui.cmd).trigger('click');
                }
            });
            $this.contextmenu('open', $this);
        },
        render: function (view, pk, viewID) {
            this.$el.html(this.generateHeader(view));
            this.generateList(view, pk, viewID);

        },
        generateHeader: function () {
            var view = this.model.getView();
            var html = [
                '<header class="card-header">',
                '<div class="card-bottom-header card-error"></div>'
            ];
            var $image = imageAdapter.convert(this.model.getCardHeaderImage()),
                image = $image ? $image.wrapAll('<div></div>').parent().html() : '';
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
                    var sql = card.getCaptionReadProc(),
                        data = {
                            parentid: pk,
                            entityid: pk,
                            entitytypeid: entityTypeID,
                            entitytype: entityTypeID
                        };
                    if (sql) {
                        var defer = bindModule.deferredBindSql(sql, data);
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
        generateList: function (view, pk, viewID) {
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
            this.$el.append(html);

            if ($.isNumeric(pk)) {
                this.createSqlTasks(cards, tabIdList, pk);
            }

        }
    });
})(Backbone, jQuery);