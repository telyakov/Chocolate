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
        /**
         *
         * @returns {string}
         */
        generateHtmlIframeAddSignButton: function () {
            return [
                '<button class="active menu-button menu-button-sigh" ',
                'title="Поставить подпись" type="button"><span>Подпись</span></button>'
            ].join('');
        },
        /**
         *
         * @param {string} html
         * @returns {string}
         */
        stripHtml: function (html) {
            var tmp = document.createElement('DIV');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText;
        },
        createJqueryElements: function () {
            this.$window = $(window);
            this.$tabs = $('#tabs');
            this.$header = $('#header');
            this.$content = $('#content');
            this.$page = $('#pagewrap');
        },
        /**
         *
         * @returns {jQuery}
         */
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
                },
                length = str.length,
                i;
            for (i = 0; i < length; i += 1) {
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
            this._idCounter += 1;
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
        /**
         *
         * @param {String} str
         * @returns {string}
         */
        engToRus: function (str) {
            return _private.engToRus(str);
        },
        /**
         *
         * @returns {jQuery}
         */
        getTabsObj: function () {
            return _private.$tabs;
        },
        /**
         *
         * @returns {jQuery}
         */
        getContentObj: function () {
            return _private.getJqueryContent();
        },
        /**
         *
         * @returns {jQuery}
         */
        getPageObj: function () {
            return _private.$page;
        },
        /**
         *
         * @returns {jQuery}
         */
        getHeaderObj: function () {
            return _private.$header;
        },
        /**
         *
         * @returns {jQuery}
         */
        getWindowObj: function () {
            return _private.$window;
        },
        /**
         * @desc Generate unique chocolate id
         * @returns {string}
         */
        uniqueID: function () {
            return _private.uniqueID();
        },
        /**
         * @desc change windows(cp1251) letters in string to unicode(utf8)
         * @param {String} str
         * @returns {string}
         */
        encodeWinToUnicode: function (str) {
            var charMap = '"ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏђ‘’“”•–—',
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

            for (i = 0; i < length; i += 1) {
                res = res + codeToChar(str.charCodeAt(i));
            }
            return res;
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
        generateTemplateTextArea: function (isAllowEdit) {
            if (isAllowEdit) {
                return [
                    '<textarea></textarea>'
                ].join('');
            } else {
                return '<textarea readonly="readonly"></textarea>'
            }
        },
        /**
         * @returns {String}
         */
        generateHtmlIframeAddSignButton: function () {
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