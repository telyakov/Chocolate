/**
 * Class CardView
 * @class
 */
var CardView = (function (Backbone, $, helpersModule, optionsModule, imageAdapter, bindModule) {
    'use strict';
    return Backbone.View.extend({
        events: {
            'keydown .card-input a': '_moveToNextElement',
            'click .tab-menu-link': '_openMenu',
            'click .card-menu-save': 'save',
            'click .card-save': 'save',
            'click .card-cancel': '_cancel'
        },
        /**
         *
         * @param options
         * @private
         */
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.model = options.model;
            this.view = options.view;
            this.id = options.id;
            if (options.$el) {
                this.$el = options.$el;
            }
        },
        $closeCardLink: null,
        _$cardMenu: null,
        /**
         * @param $li {jQuery}
         */
        destroy: function ($li) {
            this._destroyCardMenu();
            this._destroyCloseCardEventListener();
            delete this.$closeCardLink;
            facade.getTabsModule().close($li);

        },
        /**
         *
         * @param e {Event}
         * @returns {boolean}
         * @private
         */
        _cancel: function (e) {
            this._undoChange();
            this.destroy($(e.target));
            return false
        },
        /**
         *
         * @param $li {jQuery}
         * @private
         */
        _addCloseCardEventListener: function ($li) {
            var _this = this;
            _this.$closeCardLink = $li;
            this.$closeCardLink
                .on('click', '.tab-closed', function (e) {
                    return _this._cancel(e);
                })
                .on('touchmove', function (e) {
                    return _this._cancel(e);
                });
        },
        /**
         * @private
         */
        _destroyCloseCardEventListener: function () {
            if (this.$closeCardLink) {
                this.$closeCardLink.off('click');
            }
        },
        /**
         * @method undoChange
         * @private
         */
        _undoChange: function () {
            var pk = this.id;
            if (this.isChanged()) {
                var changedData = this.view.getChangedDataFromStorage()[pk],
                    data = this.getDBDataFromStorage(pk),
                    $tr = this.getJqueryParent();
                $.each(changedData, function (i) {
                    var $gridCell = $tr.find(" a[data-pk=" + pk + "][rel$=" + i + "]"),
                        oldValue = $gridCell.attr("data-value");
                    if ($gridCell.length) {
                        if (oldValue === 'null') {
                            oldValue = '';
                        }
                        $gridCell.editable("setValue", oldValue, true);

                        var fromID = $gridCell.data().editable.options['data-from-id'];
                        if (fromID) {
                            $gridCell.html(data[fromID]);
                        }
                    }
                });
            }
            if (!$.isNumeric(pk)) {
                this.getJqueryParent().remove();
            }
            this.clearStorage();
        },
        /**
         * @returns {boolean}
         */
        isChanged: function () {
            return !$.isEmptyObject(this.view.getChangedDataFromStorage()[this.id]);
        },
        /**
         * @returns {jQuery}
         */
        getJqueryParent: function () {
            return this.view.getJqueryDataTable().find('tr[data-id="' + this.getKey() + '"]');
        },
        /**
         * @method clearStorage
         */
        clearStorage: function () {
            delete this.view.getChangedDataFromStorage[this.id];
        },
        /**
         * @method save
         */
        save: function () {
            helpersModule.leaveFocus();
            this.model.trigger('save:card', {
                id: this.id
            });
        },
        /**
         * @param e {Event}
         * @returns {boolean}
         * @private
         */
        _moveToNextElement: function (e) {
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
        /**
         * @private
         */
        _destroyCardMenu: function () {
            if (this._$cardMenu) {
                this._$cardMenu.contextmenu('destroy');
                this._$cardMenu = null;
            }
        },
        /**
         * @param e {Event}
         * @private
         */
        _openMenu: function (e) {
            if (!this._$cardMenu) {
                var $this = $(e.target),
                    $tabs = $this.closest('.tab-menu').prevAll('.ui-tabs-nav').find('a'),
                    menu = [],
                    activeClass = optionsModule.getClass('activeTab');
                this._$cardMenu = $this;
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
            }
            this._$cardMenu.contextmenu('open', this._$cardMenu);
        },
        /**
         *
         * @param pk {string}
         * @param $li {jQuery}
         */
        render: function (pk, $li) {
            this._addCloseCardEventListener($li);
            this.$el.html(this._generateHeader());
            this._generateTabs(pk);
        },
        /**
         * @returns {string}
         * @private
         */
        _generateHeader: function () {
            var model = this.model,
                view = this.model.getView(),
                html = [
                    '<header class="card-header">',
                    '<div class="card-bottom-header card-error"></div>'
                ];
            var $image = imageAdapter.convert(model.getCardHeaderImage()),
                image = $image ? $image.wrapAll('<div></div>').parent().html() : '';
            if (model.hasCardHeader()) {
                html.push('<div class="card-top-header"><div class="card-header-left">');
                html.push(image);
                html.push('</div><div class="card-header-right">');
                html.push(model.getCardHeaderText());
                html.push('</div></div>');
            }
            if (optionsModule.getSetting('topsViews').indexOf(view) !== -1) {
                html.push('<menu class="menu"><button class="active menu-button card-menu-save"><span class="fa-save"></span><span>Сохранить</span></button></menu>');
            }
            html.push('</header>');
            return html.join('');
        },
        /**
         * @param pk {string}
         * @private
         */
        _generateTabs: function (pk) {
            var html = '<div data-id="grid-tabs" data-pk="' + pk + '">',
                cards = this.model.getCardROCollection(),
                isVisibleCaption = this._isVisibleCaption(cards);
            if (isVisibleCaption) {
                html += '<ul>';
            } else {
                html += '<ul class="hidden">';
            }
            var tabs = [],
                tabIdList = {};
            cards.each(
                /** @param card {CardRO} */
                    function (card) {
                    var key = card.getKey(),
                        id = helpersModule.uniqueID(),
                        tabID = helpersModule.uniqueID();
                    html += ' <li class="card-tab" data-id="' + key + '"';
                    html += ' aria-controls="' + id + '">';
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
                this._receiveHeaderCaptions(cards, tabIdList, pk);
            }

        },
        /**
         * @param cards {CardROCollection}
         * @returns {boolean}
         * @private
         */
        _isVisibleCaption: function (cards) {
            return cards.length > 1;
        },
        /**
         * @param cards {CardROCollection}
         * @param idList {Object}
         * @param pk {string}
         * @private
         */
        _receiveHeaderCaptions: function (cards, idList, pk) {
            if (this._isVisibleCaption(cards)) {
                var entityTypeID = this.model.getEntityTypeID();
                cards.each(
                    /** @param card {CardRO} */
                        function (card) {
                        var sql = card.getCaptionReadProc(),
                            data = {
                                parentid: pk,
                                entityid: pk,
                                entitytypeid: entityTypeID,
                                entitytype: entityTypeID
                            };
                        if (sql) {
                            bindModule.deferredBindSql(sql, data)
                                .done(function (res) {
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
        }
    });
})(Backbone, jQuery, helpersModule, optionsModule, imageAdapter, bindModule);