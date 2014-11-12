var Chocolate = {
    ATTACHMENTS_VIEW: 'attachments.xml',
    ID_REG_EXP: /00pk00/g,
    storage: null,
    $window: null,
    $tabs: null,
    $header: null,
    $footer: null,
    $page: null,
    $content: null,
    _idCounter: 1,
    _initStorage: function () {
        this.storage = storageModule.getStorage();
    },
    stripHtml: function strip(html) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText;
    },
    init: function () {
        this.$window = $(window);
        this.$tabs = $('#tabs');
        this.$header = $('#header');
        this.$footer = $('#footer');
        this.$content = $('#content');
        this.$page = $('#pagewrap');
        this._initStorage();
    },
    /**
     * @param className {string}
     * @returns {string}
     */
    clsSel: function (className) {
        return ['.', className ].join('');
    },
    /**
     * @param id {string}
     * @returns {string}
     */
    idSel: function (id) {
        return ['#', id].join('');
    },
    leaveFocus: function () {
        Chocolate.$content.trigger('click');
    },
    /**
     * @param number {string|integer}
     * @returns {string}
     */
    formatNumber: function (number) {
        if (number === null) {
            return null;
        }
        var result;
        if (typeof number == 'number') {
            result = number.toString();
        } else {
            result = number;
        }
        return result.replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g, "\$1 ");
    },
    /**
     * @param str {string}
     * @returns {string}
     */
    eng2rus: function (str) {
        var dictionary = {
            "q": "й", "w": "ц", "e": "у", "r": "к", "t": "е", "y": "н", "u": "г",
            "i": "ш", "o": "щ", "p": "з", "[": "х", "]": "ъ", "a": "ф", "s": "ы",
            "d": "в", "f": "а", "g": "п", "h": "р", "j": "о", "k": "л", "l": "д",
            ";": "ж", "'": "э", "z": "я", "x": "ч", "c": "с", "v": "м", "b": "и",
            "n": "т", "m": "ь", ",": "б", ".": "ю", "/": "."
        };
        for (var i = 0; i < str.length; i++) {
            var lowerToken = str[i].toLowerCase();
            if (dictionary[lowerToken] != undefined) {
                var replace;
                if (str[i] == lowerToken) {
                    replace = dictionary[lowerToken];
                } else if (str[i] == str[i].toUpperCase()) {
                    replace = dictionary[lowerToken].toUpperCase();
                }

                str = str.replace(str[i], replace);
            }
        }
        return str;
    },
    /**
     * @returns {string}
     */
    uniqueID: function () {
        this._idCounter++;
        return ['ch', this._idCounter].join('');
    },
    /**
     * @param source {Object}
     * @param addition {Object}
     * @returns {Object}
     */
    mergeObj: function (source, addition) {
        return $.extend(false, source, addition);
    },
    /**
     * @param key {string|Object}
     * @param val {string|Object}
     * @returns {string|Object}
     */
    parse: function (key, val) {
        if (typeof val == 'string') {
            return decodeURIComponent(val);
        }
        return val;
    },
    /**
     * @param url {String}
     * @returns {boolean}
     * @private
     */
    _isValidFormUrl: function (url) {
        if (url == '#') {
            return false;
        }
        return (/\?view=(.+)\.xml/g).test(url)

    },
    /**
     * @returns {boolean}
     */
    hasChange: function () {
        var session = Chocolate.storage.session, chForm;
        for (var formID in session) {
            if (formID != 'user' && session.hasOwnProperty(formID)) {
                chForm = facade.getFactoryModule().makeChGridForm($('#' + formID));
                if (chForm.isHasChange()) {
                    return true;
                }
            }
        }
        return false;
    },
    /**
     * @param url {string}
     */
    openForm: function (url) {
        if (this._isValidFormUrl(url)) {
            $.post(url)
                .done(function (res, status, jqXHR) {
                    var $form = $(res);
                    try {
                        Chocolate.$tabs.append($form);
                    } catch (e) {
                        $form.remove();
                        mediator.publish(facade.getOptionsModule().getChannel('logError'),
                            'Ошибка при вставке js + html формы в дерево',
                            e
                        );
                    } finally {
                        delete jqXHR.responseText;
                    }
                })
                .fail(function (e) {
                    mediator.publish(facade.getOptionsModule().getChannel('logError'),
                        'Ошибка при получении формы с сервера',
                        e
                    );
                });
        }
    },
    /**
     * @param template {string}
     * @param id {string|int}
     * @returns {string}
     */
    layoutTemplate: function (template, id) {
        return template.replace(Chocolate.ID_REG_EXP, id);
    },
    tab: {

        card: {
            /**
             * @param ui {Object}
             * @param content {string|jQuery}
             * @param $context {jQuery}
             * @private
             */
            _initScripts: function (ui, content, $context) {
                ui.panel.html(content);
                ChCardInitCallback.fireOnce();
                chApp.getDraw().drawCardPanel(ui.panel, $context);
                setTimeout(function () {
                    chApp.getDraw().reflowActiveTab();
                }, 0);
                ui.tab.data('loaded', 1);
            },
            /**
             * #tips 2
             * @param e {Event}
             * @param ui {Object}
             * @param $tabPanel {jQuery}
             * @returns {boolean}
             * @private
             */
            _onBeforeLoad: function (e, ui, $tabPanel) {
                if (!ui.tab.data('loaded')) {
                    var chCard = facade.getFactoryModule().makeChCard($(this)),
                        tabID = $(ui.tab).attr('data-id'),
                        pk = chCard.getKey(),
                        fmCardCollection = chCard.getFmCardCollection(),
                        isNumeric = $.isNumeric(pk),
                        template = fmCardCollection.getCardTemplate(tabID, isNumeric);
                    if (template === null) {
                        $.get(chCard.getTabDataUrl(tabID))
                            .done(function (template) {
                                var $content = $(Chocolate.layoutTemplate(template, pk));
                                try {
                                    Chocolate.tab.card._initScripts(ui, $content, $tabPanel);
                                    fmCardCollection.setCardTemplate(tabID, template, isNumeric);
                                } catch (e) {
                                    $content.remove();
                                    mediator.publish(facade.getOptionsModule().getChannel('logError'),
                                        'Возникла ошибка при инициализации шаблона',
                                        e
                                    );
                                }
                            })
                            .fail(function (e) {
                                mediator.publish(facade.getOptionsModule().getChannel('logError'),
                                    'Ошибка при получении с сервера шаблон закладки для карточки',
                                    e
                                );
                            });
                    } else {
                        Chocolate.tab.card._initScripts(ui, Chocolate.layoutTemplate(template, pk), $tabPanel);

                    }
                }
                return false;
            },
            /**
             * @param $tabPanel {jQuery}
             */
            init: function ($tabPanel) {
                $tabPanel.addClass(ChOptions.classes.card);
                $tabPanel.children('div').tabs({
                    beforeLoad: function (e, ui) {
                        return Chocolate.tab.card._onBeforeLoad.apply(this, [e, ui, $tabPanel]);
                    },
                    cache: true
                });
            }
        }
    }
};

var helpersModule = (function () {
    var context = Chocolate;
    return {
        engToRus: function (s) {
            return context.eng2rus(s);
        },
        filterSearchData: function (seacrh, key) {
            return function filter(item) {
                return item[key].toLowerCase().indexOf(seacrh) !== -1;
            };
        },
        getTabsObj: function(){
            return context.$tabs;
        },
        uniqueID: function(){
            return context.uniqueID();
        }

    };
})();
