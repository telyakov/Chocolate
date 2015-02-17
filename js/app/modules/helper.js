var helpersModule = (function ($, deferredModule, optionsModule, bindModule, document, undefined, window) {
    'use strict';
    var _private = {
        $window: null,
        $tabs: null,
        $header: null,
        $footer: null,
        $page: null,
        $content: null,
        _idCounter: 1,
        stripHtml: function (html) {
            var tmp = document.createElement('DIV');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText;
        },
        createJqueryElements: function () {
            this.$window = $(window);
            this.$tabs = $('#tabs');
            this.$header = $('#header');
            //this.$footer = $('#footer');
            this.$content = $('#content');
            this.$page = $('#pagewrap');
        },
        getJqueryContent: function () {
            return _private.$content;
        },
        leaveFocus: function () {
            _private.getJqueryContent().trigger('click');
        },
        /**
         * @param str {string}
         * @returns {string}
         */
        engToRus: function (str) {
            var dictionary = {
                "q": "й", "w": "ц", "e": "у", "r": "к", "t": "е", "y": "н", "u": "г",
                "i": "ш", "o": "щ", "p": "з", "[": "х", "]": "ъ", "a": "ф", "s": "ы",
                "d": "в", "f": "а", "g": "п", "h": "р", "j": "о", "k": "л", "l": "д",
                ";": "ж", "'": "э", "z": "я", "x": "ч", "c": "с", "v": "м", "b": "и",
                "n": "т", "m": "ь", ",": "б", ".": "ю", "/": "."
            };
            for (var i = 0; i < str.length; i++) {
                var lowerToken = str[i].toLowerCase();
                if (dictionary[lowerToken] !== undefined) {
                    var replace;
                    if (str[i] === lowerToken) {
                        replace = dictionary[lowerToken];
                    } else if (str[i] === str[i].toUpperCase()) {
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
            if (typeof val === 'string') {
                return decodeURIComponent(val);
            }
            return val;
        },
        /**
         * @returns {boolean}
         */
        hasChange: function () {
            //var session = Chocolate.storage.session, chForm;
            //for (var formID in session) {
            //    if (formID != 'user' && session.hasOwnProperty(formID)) {
            //        //todo: вернуть код
            //        //chForm = facade.getFactoryModule().makeChGridForm($('#' + formID));
            //        //if (chForm.isHasChange()) {
            //        //    return true;
            //        //}
            //
            //
            //        //resetErrors = function () {
            //        //    this.$form.find('td.grid-error').removeClass('grid-error');
            //        //};
            //        //isHasChange = function () {
            //        //    Chocolate.leaveFocus();
            //        //    if (this._isAttachmentsModel()) {
            //        //        return facade.getFilesModule().isNotEmpty(this.getID()) || !$.isEmptyObject(this.getDeletedObj());
            //        //    } else {
            //        //        return !$.isEmptyObject(this.getChangedObj()) || !$.isEmptyObject(this.getDeletedObj());
            //        //    }
            //        //}
            //
            //    }
            //}
            return false;
        }
    };
    return {
        engToRus: function (s) {
            return _private.engToRus(s);
        },
        filterSearchData: function (seacrh, key) {
            return function filter(item) {
                return item[key].toLowerCase().indexOf(seacrh) !== -1;
            };
        },
        getTabsObj: function () {
            return _private.$tabs;
        },
        getContentObj: function () {
            return _private.getJqueryContent();
        },
        getPageObj: function () {
            return _private.$page;
        },
        getFooterObj: function () {
            return _private.$footer;
        },
        getHeaderObj: function () {
            return _private.$header;
        },
        getWindowObj: function () {
            return _private.$window;
        },
        /**
         * @returns {string}
         */
        uniqueID: function () {
            return _private.uniqueID();
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

                        var sqlDefer = bindModule.runAsyncTaskBindSql(sql);
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
        scriptExpressionEval: function (expr, val, view) {
            var exprInLowerCase = expr.toLowerCase(),
                model = view.form;
            if (exprInLowerCase.indexOf('script') === 0) {
                var script = expr.substr(6),
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
                                value = $.trim(tokens[1]);
                            if (value === 'this.val') {
                                model.setDynamicDefaultValue(key, val);
                            } else if (value === 'this.caption') {
                                view.runAsyncTaskGetCurrentValue()
                                    .done(function (res) {
                                        var value = res.value;
                                        model.setDynamicDefaultValue(key, value);
                                    });
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
            return _private.mergeObj(source, addition);
        },
        leaveFocus: function () {
            _private.leaveFocus();
        },
        stripHtml: function (html) {
            return _private.stripHtml(html);
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
            if (helpersModule.isNewRow(pk)) {
                return caption;
            } else {
                return caption + ' [' + pk + ']';
            }
        },
        appHasChange: function () {
            return _private.hasChange();
        },
        parse: _private.parse,
        newLineSymbolsToBr: function (str) {
            return str.replace(/\r\n|\r|\n/g, '<br>');
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
        wrapText: function (cnt, text, marginLeft, marginTop, maxWidth, lineHeight) {
            var words = text.split(' '),
                countWords = words.length,
                line = "";
            for (var n = 0; n < countWords; n++) {
                var newLine = line + words[n] + ' ',
                    newWidth = cnt.measureText(newLine).width;
                if (newWidth > maxWidth) {
                    cnt.fillText(line, marginLeft, marginTop);
                    line = words[n] + " ";
                    marginTop += lineHeight;
                }
                else {
                    line = newLine;
                }
            }
            cnt.fillText(line, marginLeft, marginTop);
        },
        isNewRow: function (pk) {
            return $.isNumeric(pk) ? false : true;
        },
        uniqueColumnClass: function (key) {
            return 'column-' + key;
        },
        arrayBufferToBase64: function (buffer) {
            var binary = '';
            var bytes = new Uint8Array(buffer);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        },
        /**
         *
         * @param {String} str
         * @returns {String}
         */
        newLineToBr: function (str) {
            return str.replace(/\n/g, '<br/>');
        },
        /**
         * @desc Convert "18 19     22" to "18|20|"
         * @param {String} value
         * @returns {string}
         */
        filterValueFormatToIDList: function (value) {
            // Convert "18 19     22" to "18|20|"
            var numericArray = value.split(' ');
            numericArray = numericArray.filter(function (val) {
                return val !== '';
            });
            return numericArray.join('|') + '|'
        },
        /**
         *
         * @param {String} name
         * @returns {boolean}
         */
        isMultiSelectFilter: function (name) {
            return name.slice(-2) === '[]';
        },
        /**
         *
         * @param {string} name
         * @returns {string}
         */
        getCorrectXmlName: function (name) {
            if (name.indexOf('.xml') === -1) {
                name = name + '.xml';
            }
            return name.replace(/\\/g, '/').toLowerCase();
        },
        /**
         *
         * @param {jQuery} $content
         */
        waitLoading: function ($content) {
            var $div = $('<div>', {
                'class': 'refreshing'
            });
            $content.html($div);
        },
        init: function () {
            _private.createJqueryElements();
        }
    };
})(jQuery, deferredModule, optionsModule, bindModule, document, undefined, window);