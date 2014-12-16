var SelectCardElement = (function () {
    'use strict';
    return CardElement.extend({
        getCallback: function (controlID, pk) {
            var _this = this,
                column = _this.get('column');
            return function () {

                var defer = column.evalReadProc();
                defer.done(function (res) {
                    var data = helpersModule.prepareSelectSource(res.data);
                    var $el = $('#' + controlID);
                    var name = column.get('key'),
                        rawEdit = column.getRawAllowEdit(),
                        caption = column.getVisibleCaption();
                    $el.on('init', function () {
                        chCardFunction.selectInitFunction($(this), name, rawEdit);
                    })
                        .on('save', function (e, params) {
                            chCardFunction.defaultSaveFunc(e, params, name);
                        })
                        .on('hidden', function () {
                            $(this).focus();
                        }).editable({
                            onblur: 'submit',
                            name: name,
                            title: caption,
                            pk: pk,
                            type: 'select',
                            mode: 'inline',
                            validate: function(value){
                                chCardFunction.defaultValidateFunc($(this), value);
                            },
                            inputclass: 'chocolate-select',
                            showbuttons: false,
                            source: data
                        });
                });
            };

        }
    });
})();