/**
 * Class CardView
 * @class
 */
var CardView = (function (Backbone, $, helpersModule, optionsModule, imageAdapter, bindModule) {
    'use strict';
    return Backbone.View.extend(
        /** @lends CardView */
        {
            events: function () {
                return {
                    'keydown .card-input a': '_moveToNextElement',
                    'click .tab-menu-link': '_openMenu',
                    'click .card-cancel': '_cancel',
                    'click .card-menu-save': $.debounce(1500, true, this.save),
                    'click .card-save': $.debounce(1500, true, this.save)
                };
            },
            buttonsTemplate: _.template([
                '<div class="card-action-button" data-id="action-button-panel">',
                '<input class="card-save" data-id="card-save" type="button" value="Сохранить"/>',
                '<input class="card-cancel" data-id="card-cancel" type="button" value="Отменить"/>'
            ].join('')),
            /**
             *
             * @param options
             * @private
             */
            initialize: function (options) {
                _.bindAll(this, 'render');
                this.model = options.model;
                this._cardElements = [];
                this._$cardMenu = null;
                this.view = options.view;
                this.id = options.id;
                if (options.$el) {
                    this.$el = options.$el;
                }
                this.$li = this._createTabLink();
            },

            /**
             * @desc Destroy card
             */
            destroy: function () {
                var cards = this._cardElements;
                if (cards) {
                    cards.forEach(
                        /**
                         * @param object {CardRO}
                         * @param index {Number}
                         */
                            function (object, index) {
                            object.destroy();
                            delete cards[index];
                        });

                    this._cardElements = null;
                }
                this._destroyCardMenu();
                this._destroyCloseCardEventListener();
                this.model.deleteOpenedCard(this.id);
                delete this.model;
                delete this.view;
                delete this.id;
                facade.getTabsModule().close(this.$li.children('a'));
                delete this.$li;
                delete this.buttonsTemplate;

            },
            /**
             * @desc Validate required data in card and show errors
             * @returns {boolean}
             */
            validateData: function () {
                var model = this.model,
                    data = model.getActualDataFromStorage(this.id);
                var errors = model.validate(data);
                if (errors.length) {
                    this._showErrors(errors);
                    return false;
                } else {
                    return true;
                }
            },
            /**
             * @desc Show for user error messages
             * @param {Array} errors
             * @private
             */
            _showErrors: function (errors) {
                this._resetErrors();
                this._cardElements.forEach(
                    /** @param {CardElement} obj */
                        function (obj) {
                        if(errors.indexOf(obj.get('key'))!==-1){
                            obj.showError()
                        }
                    })
            },
            /**
             * @desc clear error messages in card
             * @private
             */
            _resetErrors: function () {
                this.$el.find('.card-error').removeClass('.card-error');
            },
            /**
             *
             * @param {MessageDTO} opts
             */
            showMessage: function (opts) {
                //todo: implement
                mediator.publish(optionsModule.getChannel('logError', {
                    model: this,
                    opts: opts,
                    error: 'Not implemented showMessage method'
                }))
            },
            /**
             * @param pk {string}
             * @param $panel {jQuery}
             */
            render: function (pk, $panel) {
                this.setElement($panel);
                this._addCloseCardEventListener();
                this.$el.html(this._generateHeader());
                this._generateTabs(pk);
            },
            /**
             * @method setWindowActive
             */
            setWindowActive: function () {
                var $a = this.$li.children('a');
                helpersModule.getTabsObj().tabs({active: tabsModule.getIndex($a)});
            },
            /**
             * @method initScripts
             */
            initScripts: function () {
                var _this = this;
                this.$el
                    .addClass(optionsModule.getClass('card'))
                    .children('div').tabs({
                        beforeLoad: function (e, ui) {
                            if (!ui.tab.data('loaded')) {
                                var key = $(ui.tab).attr('data-id'),
                                    card = _this.model.getCardROCollection().findWhere({
                                        key: key
                                    });
                                _this._createPanel(card, $(ui.panel));
                                ui.tab.data('loaded', 1);
                            }
                            return false;
                        },
                        cache: true
                    });
            },
            /**
             * @param card {CardRO}
             * @param $panel {jQuery}
             * @private
             */
            _createPanel: function (card, $panel) {
                var html = {},
                    _this = this,
                    pk = this.id,
                    callbacks = [],
                    event = 'render_' + helpersModule.uniqueID(),
                    elements = this.model.getCardElements(card, this.view),
                    length = elements.length,
                    asyncTaskCompleted = 0,
                    $div = $('<div>', {
                        'class': 'card-content',
                        'data-id': 'card-control',
                        'id': helpersModule.uniqueID(),
                        'data-rows': card.getRows()
                    });
                elements.each(function (obj) {
                    _this._cardElements.push(obj);
                });
                $panel.html($div);
                if (card.hasSaveButtons()) {
                    $panel.append(this.buttonsTemplate());
                }

                $.subscribe(event, function (e, data) {
                    var x = data.x,
                        y = data.y,
                        text = data.html;
                    if (!html.hasOwnProperty(y)) {
                        html[y] = {};
                    }
                    html[y][x] = text;

                    if (data.callback) {
                        callbacks.push(data.callback);
                    }
                    asyncTaskCompleted += 1;
                    if (asyncTaskCompleted === length) {
                        $.unsubscribe(event);
                        var cardHtml = '';
                        var i,
                            j,
                            hasOwn = Object.hasOwnProperty;
                        for (i in html) {
                            if (hasOwn.call(html, i)) {
                                for (j in html[i]) {
                                    if (hasOwn.call(html[i], j)) {
                                        cardHtml += html[i][j];
                                    }
                                }
                            }
                        }
                        $div.html(cardHtml);
                        callbacks.forEach(function (fn) {
                            fn();
                        });
                        setTimeout(function () {
                            mediator.publish(optionsModule.getChannel('reflowTab'));
                        }, 0);
                    }
                });
                var i = 0;
                elements.each(function (model) {
                    model.render(event, i, card, pk);
                    i += 1;
                });
            },
            /**
             *
             * @returns {jQuery}
             * @private
             */
            _createTabLink: function () {
                var caption = this._getCaption(),
                    $tabs = helpersModule.getTabsObj(),
                    $li = $('<li>', {
                        'html': facade.getTabsModule().createTabLink('', caption)
                    });

                facade.getTabsModule().push($li);
                $tabs.children('ul').append($li);
                $tabs.tabs('refresh');
                return $li;
            },
            /**
             *
             * @returns {string}
             * @private
             */
            _getCaption: function () {
                var caption = this.model.getCardTabCaption(),
                    pk = this.id;
                if ($.isNumeric(pk)) {
                    caption += ' [' + pk + ']';
                } else {
                    caption += '[новая запись]';
                }
                return caption;
            },
            /**
             * @returns {boolean}
             * @private
             */
            _cancel: function () {
                this._undoChange();
                this.destroy();
                return false
            },
            /**
             *
             * @private
             */
            _addCloseCardEventListener: function () {
                var _this = this;
                this.$li
                    .on('click', '.tab-closed', function (e, data) {
                        if(data && data.isFastClose && _this.isChanged()){
                            return false;
                        }else{
                            return _this._cancel();
                        }
                    })
                    .on('touchmove', function () {
                        return _this._cancel();
                    });
            },
            /**
             * @private
             */
            _destroyCloseCardEventListener: function () {
                if (this.$li) {
                    this.$li.off('click');
                }
            },
            /**
             * @method undoChange
             * @private
             */
            _undoChange: function () {
                //todo: реализовать
                var pk = this.id;
                if (this.isChanged()) {
                    var changedData = this.model.getChangedDataFromStorage()[pk],
                        data = this.model.getDBDataFromStorage(pk),
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
                return !$.isEmptyObject(this.model.getChangedDataFromStorage()[this.id]);
            },
            /**
             * @returns {jQuery}
             */
            getJqueryParent: function () {
                return this.view.getJqueryDataTable().find('tr[data-id="' + this.id + '"]');
            },
            /**
             * @method clearStorage
             */
            clearStorage: function () {
                delete this.model.getChangedDataFromStorage[this.id];
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