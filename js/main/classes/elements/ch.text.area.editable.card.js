function ChTextAreaEditableCard($elem) {
    ChEditable.apply(this, arguments);
}
ChTextAreaEditableCard.prototype = Object.create(ChEditable.prototype);
ChTextAreaEditableCard.prototype.create = function (context, e, allow_edit, name, caption, isNeedFormat, isMarkupSupport) {

    if (!allow_edit) {
        $(context).unbind('click')
    }
    var $elem = this.$elem, $cell = $elem.parent(),
        ch_card_element = new ChCardElement($cell),
        $text_modal = $('<a class="grid-textarea"></a>'),
        _this = this;
    $text_modal.appendTo($cell.closest('.card-content'));
    var $btn = $elem.find('div.grid-modal-open');
    if ($btn.length == 0) {
        $btn = $("<div class='grid-modal-open'></div>").appendTo($cell);

        $btn.on('click', function (e) {
            Chocolate.leaveFocus();
            if (isMarkupSupport) {
                if (typeof($text_modal.attr('data-init')) == 'undefined') {
                    chFunctions.wysiHtmlInit($text_modal, _this.getTitle(ch_card_element.getID(), caption));
                    $text_modal.on('save', function (e, params) {
                        if (allow_edit) {
                            if (typeof(params.newValue) != 'undefined') {
                                ch_card_element.setChangedValue(name, params.newValue);
                                $elem.editable("setValue", params.newValue);
                                $text_modal.empty();

                            }
                        } else {
                            return false;
                        }
                    });
                    $text_modal.on('hidden', function () {
                        $elem.focus();
                    });
                    $text_modal.attr('data-init', 1);
                }

                var value = $elem.editable('getValue')[name];
                if (typeof(value) == 'undefined') {
                    value = '';
                }
                if (isNeedFormat) {
                    value = value.replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g, "\$1 ");
                }
                if (value) {
                    value = value.toString()
                    value = value.replace(/\r\n|\r|\n/g, '<br>');
                }
                $text_modal.editable('setValue', value);
                $text_modal.editable('show');
                var $textArea = $text_modal.next('div').find('textarea');
                if (!allow_edit) {
                    $textArea.attr('readonly', 'true')
                } else {
                    var editor = new wysihtml5.Editor($textArea.get(0));
                    editor.on("load", function (e) {
                        var $tbody = $textArea.siblings('iframe').eq(1).contents().find('body');
                        if (name == 'commentforreport' && Chocolate.user.getName() == 'Игнатьев Дмитрий Иванович') {
                            $tbody.on('keydown', {editor: $textArea.data("wysihtml5").editor}, ChocolateEvents.addSignToIframeHandler);
                        }
                        else {
                            $tbody.on('keydown', ChocolateEvents.addSignToIframeHandler);
                        }
                        $tbody.on('keydown', function(e){
                            var keys = chApp.namespace('events.KEY');
                            if(e.keyCode == keys.ESCAPE){
                               $text_modal.editable('hide');
                            }
                        })
                    });
                }
                e.preventDefault()

            } else {
                if (typeof($text_modal.attr('data-init')) == 'undefined') {
                    $text_modal.editable({type: 'textarea', mode: 'popup', onblur: 'ignore', savenochange: false, title: _this.getTitle(ch_card_element.getID(), caption)});
                    $text_modal.on('save', function (e, params) {
                        if (allow_edit) {
                            if (typeof(params.newValue) != 'undefined') {
                                ch_card_element.setChangedValue(name, params.newValue);
                                $elem.editable("setValue", params.newValue);
                                $text_modal.empty();

                            }
                        } else {
                            return false;
                        }
                    })
                        .on('hidden', function () {
                            $elem.focus();
                        });
                    $text_modal.attr('data-init', 1);
                }

                var value = $elem.editable('getValue')[name];
                if (typeof(value) == 'undefined') {
                    value = '';
                }
                if (isNeedFormat) {
                    value = value.replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g, "\$1 ");
                }
                value = value.toString()
                $text_modal.editable('setValue', value);
                $text_modal.editable('show');
                if (!allow_edit) {
                    $text_modal.next('div').find('textarea').attr('readonly', 'true')
                }
                e.preventDefault();
                return false
            }
            return false
        })
    }

};
