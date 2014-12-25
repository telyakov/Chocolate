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
    leaveFocus: function () {
        Chocolate.$content.trigger('click');
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
        boolEval: function (val, def) {
            var prepareVal = $.trim(val.toLowerCase());
            switch (true) {
                case prepareVal === 'true':
                    return true;
                case prepareVal === 'false':
                    return false;
                default:
                    return def;

            }
        },
        intExpressionEval: function (expr, def) {

            if (expr !== null && expr !== '' && expr !== undefined) {
                if ($.isNumeric(expr)) {
                    return parseInt(expr, 10);
                } else {
                    return expr;
                }
            } else {
                return def;
            }

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

                        var sqlDefer = bindModule.deferredBindSql(sql);
                        sqlDefer.done(function (data) {
                            var sql = data.sql;
                            mediator.publish(optionsModule.getChannel('socketRequest'), {
                                query: sql,
                                type: optionsModule.getRequestType('deferred'),
                                id: deferId
                            });
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
        defaultExpressionEval: function (expr) {
            var raw = $.trim(expr.toLowerCase());
            switch (true) {
                case raw === 'currentuserfio':
                    return userModule.getName();
                case raw === 'userid':
                    return userModule.getID();
                case raw === 'currentemployeeid':
                    return userModule.getEmployeeID();
                default:
                    return expr;
            }
        },
        scriptExpressionEval: function (expr, e, model) {
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
                            model.trigger('refresh:form', {isLazy: true});
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
        decToHeh: function (dec) {
            var decColor = parseInt(dec, 10),
                hexColor = decColor.toString(16);
            if (hexColor.length < 6) {
                while (hexColor.length < 6) {
                    hexColor += '0' + hexColor;
                }
            }
            var R = [hexColor.charAt(4), hexColor.charAt(5)].join(''),
                G = [hexColor.charAt(2), hexColor.charAt(3)].join(''),
                B = [hexColor.charAt(0), hexColor.charAt(1)].join('');
            return [R, G, B].join('');
        },
        prepareSelectSource: function (data) {
            var result = [],
                iterator;
            for (iterator in data) {
                if (data.hasOwnProperty(iterator)) {
                    result.push({
                        text: data[iterator].name,
                        value: data[iterator].id
                    });
                }
            }
            return result;
        },
        prepareTreeSource: function (data) {
            var result = [],
                iterator;
            for (iterator in data) {
                if (data.hasOwnProperty(iterator)) {
                    result.push({
                        text: data[iterator].name,
                        id: data[iterator].id,
                        description: data[iterator].description ?
                            data[iterator].description :
                            ''
                    });
                }
            }
            return result;
        },
        merge: function (source, addition) {
            return context.mergeObj(source, addition);
        },
        leaveFocus: function () {
            context.leaveFocus();
        },
        stripHtml: function (html) {
            return context.stripHtml(html);
        },
        addSignToIframe: function (e) {
            if (e.keyCode === optionsModule.getKeyCode('f4')) {
                var userModule = facade.getUserModule();
                $(this).insertAtCaretIframe(userModule.getSign());
                return false;
            }
            return true;
        },
        createTitleHtml: function (pk, caption) {
            if ($.isNumeric(pk)) {
                return caption + ' [' + pk + ']';
            } else {
                return caption;
            }
        },
        appHasChange: function () {
            return context.hasChange();
        },
        parse: context.parse,
        newLineSymbolsToBr: function (str) {
            return str.replace(/\r\n|\r|\n/g, '<br>');
        },
        treeViewOptions: function ($context, isSingle) {
            var options = {
                children: $context.data().editable.options.source,
                getInput: function () {
                    return this;
                },
                getTitleValue: function (node) {
                    return node.text;
                },
                getKey: function (node) {
                    return node.id;
                },
                getParentID: function (node) {
                    return null;
                },
                restore_state: true,
                expand_nodes: true,
                defaultValues: function () {
                    return this.attr('data-value');
                },
                infoPanel: true,
                separator: '|',
                checkbox: true,
                okButton: function ($tree, $input, $checkbox, $select) {
                    var chDynatree = this;
                    return  {
                        'text': 'Сохранить',
                        'class': 'wizard-active wizard-next-button',
                        click: function (bt, elem) {
                            var selected_nodes = $tree.dynatree("getSelectedNodes");
                            var val = '', select_html = '';
                            var is_select_all = chDynatree.isSelectAll();
                            for (var i in selected_nodes) {
                                var node = selected_nodes[i];
                                if (is_select_all || node.childList === null) {
                                    val += node.data.key;
                                    if (!chDynatree.isSingleMode()) {
                                        val += chDynatree.getSeparator();
                                    }
                                    if (i > 0) {
                                        select_html += '/';
                                    }
                                    select_html += node.data.title;
                                }
                            }
                            //todo: вернуть код
                            //var column = facade.getFactoryModule().makeChGridColumnBody($input);
                            var name = $input.data().editable.options.name;
                            //column.setChangedValue(name, val);
                            $input.attr('data-value', val);
                            $input.html(select_html);
                            $checkbox.children('input').attr('checked', false);
                            $(this).dialog("close");
                        }};
                }
            };
            if (isSingle) {
                options.selectMode = 1;
            }
            return options;
        },
        textShown: function (e, editable) {
            var $body = editable.$form.find("iframe").contents().find("body");
            $body
                .on("keydown.chocolate", function () {
                    $(this).unbind('keydown.chocolate');
                    editable.$element.attr('data-change', 1);
                })
                .on('keydown', helpersModule.addSignToIframe);
        },
        wysiHtmlInit: function ($target, title) {
            $target.editable({
                type: 'wysihtml5',
                wysihtml5: {
                    "font-styles": true, //Font styling, e.g. h1, h2, etc. Default true
                    "emphasis": true, //Italics, bold, etc. Default true
                    "lists": true, //(Un)ordered lists, e.g. Bullets, Numbers. Default true
                    "html": false, //Button which allows you to edit the generated HTML. Default false
                    "link": false, //Button to insert a link. Default true
                    "image": false, //Button to insert an image. Default true,
                    "color": false //Button to change color of font
                },
                mode: 'popup',
                onblur: 'ignore',
                savenochange: false,
                title: title
            });
        },
        checkBoxDisplay: function (value, $context, customProperties, view) {
            var label = customProperties.get('label'),
                color = customProperties.get('color'),
                priority = customProperties.get('priority');
            var isNeedChangeColor = false;
            if ($context.closest('tr').length && color && priority) {
                isNeedChangeColor = true;
            }
            if (typeof(value) !== 'undefined' && parseInt(value, 10)) {
                if (isNeedChangeColor) {
                    view.addPriorityColorAndApply($context.attr('data-pk'), priority, color);
                }
                setTimeout(function () {
                    if (label === optionsModule.getSetting('attention')) {
                        $context.html('<span class="fa-exclamation"></span>');
                    } else if (label === optionsModule.getSetting('notView')) {
                        $context.html('<span class="fa-question"></span>');
                    }
                    else {
                        $context.html('<span class="fa-check"></span>');
                    }
                }, 0);

            } else {
                if (isNeedChangeColor) {
                    view.removePriorityColorAndApply($context.attr('data-pk'), priority);
                }
                $context.html('');
            }
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
            if (typeof number === 'number') {
                result = number.toString();
            } else {
                result = number;
            }
            return result.replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g, "$1 ");
        },
        init: function () {
            context.init();
        }

    };
})(jQuery, deferredModule, optionsModule, bindModule);