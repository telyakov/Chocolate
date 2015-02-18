$(function () {
    'use strict';
    /* jQuery Tiny Pub/Sub - v0.7 - 10/27/2011
     * http://benalman.com/
     * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL */
    (function ($) {
        var o = $({});
        $.subscribe = function () {
            o.on.apply(o, arguments);
        };
        $.unsubscribe = function () {
            o.off.apply(o, arguments);
        };
        $.publish = function () {
            o.trigger.apply(o, arguments);
        };
    }(jQuery));

    /**
     * x-editable default templates
     * @see http://vitalets.github.io/x-editable/docs.html#global
     */
    if (typeof $.fn.editableform === 'function') {
        $.fn.editableform.buttons =
            [
                '<button type="submit" class="editable-submit wizard-cancel-button">Сохранить</button>',
                '<button type="button" class="editable-cancel wizard-cancel-button">Отменить</button>'
            ].join('');

        $.fn.editableform.loading = '';
        $.fn.editableform.template = [
            '<form class="form-inline editableform">',
            '<div class="control-group">',
            '<div><div class="editable-input"></div><div class="editable-buttons"></div></div>',
            '</div></form>'
        ].join('')
    }
    /**
     * @function
     * @name jQuery.insertAtCaret
     */
    $.fn.extend({
        insertAtCaretIframe: function (val) {
            var winObject = function (el) {
                var doc = el.ownerDocument;
                return doc.defaultView || doc.parentWindow;
            };
            return this.each(function () {
                    var sel, range, w = this;
                    w = winObject(w);
                    if (w.getSelection) {
                        // IE9 and non-IE
                        sel = w.getSelection();
                        if (sel.getRangeAt && sel.rangeCount) {
                            range = sel.getRangeAt(0);
                            range.deleteContents();

                            // Range.createContextualFragment() would be useful here but is
                            // only relatively recently standardized and is not supported in
                            // some browsers (IE9, for one)
                            var el = w.document.createElement('div');
                            el.innerHTML = val;
                            var frag = w.document.createDocumentFragment(), node, lastNode;
                            while ((node = el.firstChild)) {
                                lastNode = frag.appendChild(node);
                            }
                            range.insertNode(frag);

                            // Preserve the selection
                            if (lastNode) {
                                range = range.cloneRange();
                                range.setStartAfter(lastNode);
                                range.collapse(true);
                                sel.removeAllRanges();
                                sel.addRange(range);
                            }
                        }
                    } else if (w.document.selection && w.document.selection.type !== "Control") {
                        // IE < 9
                        w.document.selection.createRange().pasteHTML(val);
                    }
                }
            );
        },
        insertAtCaret: function (val) {
            return this.each(function () {
                if (document.selection) {
                    //For browsers like Internet Explorer
                    this.focus();
                    var sel = document.selection.createRange();
                    sel.text = val;
                    this.focus();
                }
                else if (this.selectionStart || this.selectionStart === 0) {
                    //For browsers like Firefox and Webkit based
                    var startPos = this.selectionStart,
                        endPos = this.selectionEnd,
                        scrollTop = this.scrollTop,
                        selectionEnd = startPos + val.length;
                    this.value = this.value.substring(0, startPos) + val + this.value.substring(endPos, this.value.length);
                    this.focus();
                    this.selectionStart = selectionEnd;
                    this.selectionEnd = selectionEnd;
                    this.scrollTop = scrollTop;
                } else {
                    this.value += val;
                    this.focus();
                }
            });
        }
    });

    /**
     * tablesorter checkbox parser
     * Copyright (c) 2014 by Tselishev Semen
     */
    $.tablesorter.addParser({
        id: 'checkbox',
        is: function () {
            return false;
        },
        format: function (s, table, cell) {
            return $(cell).find('a').attr('data-value');
        },
        parsed: false,
        type: 'text'
    });
    /**
     * for ie lt 8
     */
    if (!Object.create) {
        Object.create = (function () {
            function F() {
            }

            return function (o) {
                if (arguments.length !== 1) {
                    throw new Error('Object.create implementation only accepts one parameter.');
                }
                F.prototype = o;
                return new F();
            };
        })();
    }
});
