var CardView = (function (Backbone, $, helpersModule, optionsModule, imageAdapter, bindModule, tabsModule) {
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
             * @class CardView
             * @extends Backbone.View
             * @constructs
             * @param {Object} options
             * @private
             */
            initialize: function (options) {
                _.bindAll(this);
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
             * @public
             * @desc Destroy card
             */
            destroy: function () {
                var cards = this._cardElements;
                if (cards) {
                    cards.forEach(
                        /**
                         * @param {CardElement} model
                         * @param {Number} index
                         */
                            function (model, index) {
                            model.destroy();
                            delete cards[index];
                        });

                    this._cardElements = null;
                }
                this._destroyCardMenu();
                this._destroyCloseCardEventListener();
                this.getModel().deleteOpenedCard(this.id);
                this.model = null;
                this.view = null;
                this.id = null;
                facade.getTabsModule().close(this.$li.children('a'));
                this.$li = null;
                this.undelegateEvents();
                this.$el.removeData().unbind();
                this.remove();
                Backbone.View.prototype.remove.call(this);

            },
            /**
             * @public
             * @param {string} id
             * @param {jQuery} $panel
             */
            render: function (id, $panel) {
                this.setElement($panel);
                this._addCloseCardEventListener();
                this.$el.html(this._generateHeader());
                this._generateTabs(id);
            },
            /**
             * @public
             * @returns {FormModel}
             */
            getModel: function () {
                return this.model;
            },
            /**
             * @public
             * @desc Validate required data in card and show errors
             * @returns {boolean}
             */
            validateData: function () {
                var model = this.getModel(),
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
             * @public
             * @method setWindowActive
             */
            setWindowActive: function () {
                var $a = this.$li.children('a');
                helpersModule.getTabsObj().tabs({
                    active: tabsModule.getIndex($a)
                });
            },
            /**
             * @public
             * @desc initScripts
             */
            initScripts: function () {
                this.$el
                    .addClass(optionsModule.getClass('card'))
                    .children('div').tabs({
                        beforeLoad: this._beforeLoadInitScripts
                    });
            },
            /**
             *
             * @param {Event} e
             * @param {Object} ui
             * @returns {boolean}
             * @private
             */
            _beforeLoadInitScripts: function (e, ui) {
                if (!ui.tab.data('loaded')) {
                    var key = $(ui.tab).attr('data-id'),
                        card = this.getModel().getCardROCollection().findWhere({
                            key: key
                        });
                    this._createPanel(card, $(ui.panel));
                    ui.tab.data('loaded', 1);
                }
                return false;
            },
            /**
             * @desc Show for user error messages
             * @param {Array} errors
             * @private
             */
            _showErrors: function (errors) {
                this._resetErrors();
                this._cardElements.forEach(
                    /** @param {CardElement} model */
                        function (model) {
                        if (errors.indexOf(model.get('key')) !== -1) {
                            model.showError()
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
             * @param {CardRO} card
             * @param {jQuery} $panel
             * @returns {jQuery}
             * @private
             */
            _createContent: function (card, $panel) {
                var $content = $('<div></div>', {
                    'class': 'card-content',
                    'data-id': 'card-control',
                    id: helpersModule.uniqueID(),
                    'data-rows': card.getRows()
                });
                $panel.html($content);
                if (card.hasSaveButtons() && this.getModel().isAllowWrite()) {
                    $panel.append(this.buttonsTemplate())
                }
                return $content;
            },
            /**
             *
             * @param {string} eventName
             * @param {jQuery} $content
             * @param {Number} elementsCount
             * @private
             */
            _subscribeToRenderEvents: function (eventName, $content, elementsCount) {
                var html = {},
                    completedTaskCount = 0,
                    callbacks = [],
                    _this = this;
                $.subscribe(eventName,
                    /**
                     *
                     * @param {Event} e
                     * @param {CardElementLayoutDTO} data
                     */
                        function (e, data) {
                        var x = data.x,
                            y = data.y;

                        if (!html.hasOwnProperty(y)) {
                            html[y] = {};
                        }
                        html[y][x] = data.html;

                        if (data.callback) {
                            callbacks.push(data.callback);
                        }
                        completedTaskCount += 1;
                        if (completedTaskCount === elementsCount) {
                            _this._renderEventsDone(eventName, html, callbacks, $content);
                        }
                    });
            },
            /**
             *
             * @param {String} eventName
             * @param {Object} data
             * @param {function[]} callbacks
             * @param {jQuery} $content
             * @private
             */
            _renderEventsDone: function (eventName, data, callbacks, $content) {
                $.unsubscribe(eventName);
                var html = '',
                    i,
                    j,
                    hasOwn = Object.prototype.hasOwnProperty;
                for (i in data) {
                    if (hasOwn.call(data, i)) {
                        for (j in data[i]) {
                            if (hasOwn.call(data[i], j)) {
                                html += data[i][j];
                            }
                        }
                    }
                }
                $content.html(html);
                callbacks.forEach(function (fn) {
                    fn();
                });
                setTimeout(function () {
                    mediator.publish(optionsModule.getChannel('reflowTab'));
                }, 0);
            },
            /**
             * @param {CardRO} card
             * @param {jQuery} $panel
             * @private
             */
            _createPanel: function (card, $panel) {
                var model = this.getModel(),
                    _this = this,
                    id = this.id,
                    event = 'render_' + helpersModule.uniqueID(),
                    elements = model.getCardElements(card, this.view),
                    elementsCount = elements.length;
                this._cardElements = elements;
                var $content = _this._createContent(card, $panel);
                _this._subscribeToRenderEvents(event, $content, elementsCount);
                var order = 0;
                elements.forEach(
                    /**
                     * @param {CardElement} model
                     */
                        function (model) {
                        model.render(event, order, card, id);
                        order += 1;
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
                    $li = $('<li></li>', {
                        html: facade.getTabsModule().createTabLink('', caption)
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
                var caption = this.getModel().getCardTabCaption(),
                    id = this.id;
                if (helpersModule.isNewRow(id)) {
                    caption += '[новая запись]';
                } else {
                    caption += ' [' + id + ']';
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
                        if (data && data.isFastClose && _this.isChanged()) {
                            return false;
                        } else {
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
                if (helpersModule.isNewRow(this.id)) {
                    var data = {};
                    data[this.id] = { id:  this.id};
                    /**
                     *
                     * @type {FormChangeDTO}
                     */
                    var changeDTO = {
                        op: 'del',
                        data: data
                    };
                    this.getModel().trigger('change:form', changeDTO);
                }else{
                    this.getModel().trigger('change:form', {
                        op: 'upd',
                        id: this.id,
                        data: {}
                    });
                }
                this._clearStorage();
            },
            /**
             * @returns {boolean}
             */
            isChanged: function () {
                return !$.isEmptyObject(this.model.getChangedDataFromStorage()[this.id]);
            },
            /**
             * @desc clearStorage
             * @private
             */
            _clearStorage: function () {
                delete this.getModel().getChangedDataFromStorage()[this.id];
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
                                bindModule.runAsyncTaskBindSql(sql, data)
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
})
(Backbone, jQuery, helpersModule, optionsModule, imageAdapter, bindModule, tabsModule);