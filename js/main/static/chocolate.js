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
        return ['.', className].join('');
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

var helpersModule = (function ($, deferredModule, optionsModule, bindModule) {

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
        getTabsObj: function () {
            return context.$tabs;
        },
        getContentObj: function () {
            return context.$content;
        },
        getPageObj: function () {
            return context.$page;
        },
        getFooterObj: function () {
            return context.$footer;
        },
        getHeaderObj: function () {
            return context.$header;
        },
        getWindowObj: function () {
            return context.$window;
        },
        uniqueID: function () {
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
        winToUnicode: function (str) {
            var charMap = unescape(
                    [
                        '%u0402%u0403%u201A%u0453%u201E%u2026%u2020%u2021%u20AC%u2030%u0409%u2039%u040A%u040C%u040B%u040F',
                        '%u0452%u2018%u2019%u201C%u201D%u2022%u2013%u2014%u0000%u2122%u0459%u203A%u045A%u045C%u045B%u045F',
                        '%u00A0%u040E%u045E%u0408%u00A4%u0490%u00A6%u00A7%u0401%u00A9%u0404%u00AB%u00AC%u00AD%u00AE%u0407',
                        '%u00B0%u00B1%u0406%u0456%u0491%u00B5%u00B6%u00B7%u0451%u2116%u0454%u00BB%u0458%u0405%u0455%u0457'
                    ].join('')
                ),
                codeToChar = function (code) {
                    if (code >= 0xC0 && code <= 0xFF) {
                        return String.fromCharCode(code - 0xC0 + 0x0410);
                    }
                    if (code >= 0x80 && code <= 0xBF) {
                        return charMap.charAt(code - 0x80);
                    }
                    return String.fromCharCode(code);
                },
                res = '',
                i,
                length = str.length;

            for (i = 0; i < length; i++) {
                res = res + codeToChar(str.charCodeAt(i));
            }
            return res;
        },
        openForm: function (url) {
            context.openForm(url);
        },
        boolExpressionEval: function (expr, deferId, defaultValue) {
            var prepareExpr = $.trim(expr.toLowerCase());
            switch (true) {
                case prepareExpr === 'true':
                    deferredModule.pop(deferId).resolve({
                        value: true
                    });
                    break;
                case prepareExpr === 'false':
                    deferredModule.pop(deferId).resolve({
                        value: false
                    });
                    break;
                case prepareExpr.indexOf('sql') === 0:
                    var posEqualSign = prepareExpr.indexOf('=');
                    if (posEqualSign === -1) {
                        deferredModule.pop(deferId).resolve({
                            value: false
                        });
                    } else {
                        var posSql = posEqualSign + 1,
                            sql = $.trim(prepareExpr.substr(posSql));
                        sql = bindModule.bindSql(sql);
                        console.log(sql)
                        mediator.publish(optionsModule.getChannel('socketRequest'), {
                            query: sql,
                            type: optionsModule.getRequestType('deferred'),
                            id: deferId
                        });
                    }
                    break;
                default:
                    deferredModule.pop(deferId).resolve({
                        value: defaultValue
                    });

            }
            //    case strpos($prepareExpr, 'role') === 0:
            //        //todo: реализовать поддержку кисовских ролей
            //        return false;
            //    default:

        },
        scriptExpressionEval: function (expr, e) {
            var exprInLowerCase = expr.toLowerCase();
            if (exprInLowerCase.indexOf('script') === 0) {
                var script = expr.substr(6),
                    $this = $(e.target),
                    filter = facade.getFactoryModule().makeChFilter($this),
                    commands = script.split(';');
                commands.forEach(function (cmd) {
                    var prepareCmd = $.trim(cmd).toLowerCase(),
                        defaultKey = 'dataform.defvalues';
                    switch (true) {
                        case prepareCmd === 'dataform.refreshdata':
                            filter.getChForm().LazyRefresh();
                            break;
                        case prepareCmd.indexOf(defaultKey) === 0:
                            var args = prepareCmd.substr(defaultKey.length + 1),
                                tokens = args.split('='),
                                key = $.trim(tokens[0]),
                                filterForm,
                                value = $.trim(tokens[1]);
                            if (value === 'this.val') {
                                filterForm = filter.getChFilterForm();
                                var val = filterForm.getValueByKey(filter.getKey());
                                filter.getChForm().setDefaultValue(key, val);
                            } else if (value === 'this.caption') {
                                filterForm = filter.getChFilterForm();
                                var caption = filterForm.getCaptionByKey(filter.getKey());
                                filter.getChForm().setDefaultValue(key, caption);
                            }
                            break;
                        default:
                            break;
                    }
                });

            }


        },
        init: function () {
            context.init();
        }

    };
})(jQuery, deferredModule, optionsModule, bindModule);