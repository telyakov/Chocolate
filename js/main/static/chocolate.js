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
        getContentObj: function(){
            return context.$content;
        },
        getPageObj: function(){
            return context.$page;
        },
        getFooterObj: function(){
            return context.$footer;
        },
        getHeaderObj: function(){
            return context.$header;
        },
        getWindowObj: function(){
            return context.$window;
        },
        uniqueID: function(){
            return context.uniqueID();
        },
        /**
         * @param template {string}
         * @param id {string|int}
         * @returns {string}
         */
        layoutTemplate: function (template, id) {
            return template.replace(Chocolate.ID_REG_EXP, id);
        },
        openForm: function(url){
            context.openForm(url);
        },
        init: function(){
            context.init();
        }

    };
})();
