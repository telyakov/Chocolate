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
        /**
         *
         * @param {String} id
         * @returns {boolean}
         */
        isNewRow: function (id) {
            return $.isNumeric(id) ? false : true;
        },
        generateHtmlIframeAddSignButton: function(){
            return [
                '<button class="active menu-button menu-button-sigh" ',
                'title="Поставить подпись" type="button"><span>Подпись</span></button>'
            ].join('');
        },
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
         * @returns {boolean}
         */
        appHasChange: function () {
            var session = storageModule.getSession(),
                property,
                hasOwn = Object.prototype.hasOwnProperty;
            for (property in session) {
                if (hasOwn.call(session, property) && property !== 'user') {
                    if (!$.isEmptyObject(session[property].changed)) {
                        return true;
                    }
                }
            }
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
        /**
         *
         * @param {String} dec
         * @returns {string}
         */
        convertDecColorToHeh: function (dec) {
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
        /**
         * @desc prepare data to expected select format
         * @param {Object} data
         * @returns {Array}
         */
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
        /**
         * @desc prepare data to expected tree format
         * @param {Object} data
         * @returns {Array}
         */
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
        /**
         *
         * @param {Object} source
         * @param {Object} addition
         * @returns {Object}
         */
        merge: function (source, addition) {
            return _private.mergeObj(source, addition);
        },
        /**
         * @desc Leave focus from current active element
         */
        leaveFocus: function () {
            _private.leaveFocus();
        },
        /**
         * @desc remove html tags in strings
         * @param {String} html
         * @returns {String}
         */
        stripHtml: function (html) {
            return _private.stripHtml(html);
        },
        /**
         *
         * @returns {boolean}
         */
        appHasChange: function () {
            return _private.appHasChange();
        },
        /**
         *
         * @param {Boolean} isAllowEdit
         * @returns {string}
         */
        generateTemplateTextArea: function(isAllowEdit){
          if(isAllowEdit){
              return [
                  '<textarea></textarea>'
              ].join('');
          }else{
              return '<textarea readonly="readonly"></textarea>'
          }
        },
        /**
         * @returns {String}
         */
        generateHtmlIframeAddSignButton: function(){
          return _private.generateHtmlIframeAddSignButton();
        },
        /**
         *
         * @param {string} value
         * @param {jQuery} $context
         * @param {ColumnCustomProperties} customProperties
         * @param {GridView} view
         */
        checkBoxDisplay: function (value, $context, customProperties, view) {
            var label = customProperties.get('label'),
                color = customProperties.get('color'),
                priority = customProperties.get('priority');
            var isNeedChangeColor = false;
            if ($context.closest('tr').length && color && priority) {
                isNeedChangeColor = true;
            }
            if (value !== undefined && parseInt(value, 10)) {
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
         * @param {string|integer} number
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
        /**
         *
         * @param {String} id
         * @returns {boolean}
         */
        isNewRow: function (id) {
            return _private.isNewRow(id);
        },
        /**
         *
         * @param {String} key
         * @returns {string}
         */
        uniqueColumnClass: function (key) {
            return 'column-' + key;
        },
        /**
         * @param {ArrayBuffer} buffer
         * @returns {string}
         */
        arrayBufferToBase64: function (buffer) {
            var binary = [],
                bytes = new Uint8Array(buffer),
                len = bytes.byteLength,
                i;
            for (i = 0; i < len; i += 1) {
                binary.push(String.fromCharCode(bytes[i]));
            }
            return window.btoa(binary.join(''));
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
            var $div = $('<div></div>', {
                'class': 'refreshing'
            });
            $content.html($div);
        },
        init: function () {
            _private.createJqueryElements();
        }
    };
})(jQuery, deferredModule, optionsModule, bindModule, document, undefined, window);