var TextCardElement = (function () {
    'use strict';
    return CardElement.extend({
        controlTemplate: _.template(
            [
                '<div class="table-td">',
                '<a tabindex="<%=tabindex %>" class="<%= cls %>" id="<%=id %>" rel="<%=key+\'_\' +pk %>" data-pk="<%=pk %>"',
                '></a>',
                '</div>'
            ].join('')
        ),
        renderControl: function (pk, controlID, tabindex) {
            return this.controlTemplate({
                tabindex: tabindex,
                id: controlID,
                key: this.get('column').get('key'),
                pk: pk,
               cls: this.get('column').getColumnCustomProperties().get('markupSupport')? 'ch-card-iframe': ''
            });
        },
        getCallback: function (controlID, pk) {
            var _this = this,
                column = _this.get('column'),
                customProperties = column.getColumnCustomProperties();
            return function () {
                var $el = $('#' + controlID);
                var name = column.get('key'),
                    rawEdit = column.getRawAllowEdit(),
                    isMarkupSupport = customProperties.get('markupSupport'),
                    caption = column.getVisibleCaption();

                var options = {
                    name: name,
                    pk: pk,
                    title: caption,
                    mode: 'inline',
                    showbuttons: false,
                    emptytext: '',
                    onblur: 'submit',
                    inputclass: 'chocolate-textarea',
                    validate: function (value) {
                        chCardFunction.defaultValidateFunc($(this), value);
                    }
                };
                if (isMarkupSupport) {
                    $el.on('shown', function (e, editable) {
                        chFunctions.textShownFunction(e, editable);
                    });
                    options.type = 'wysihtml5';
                    options.wysihtml5 = {
                        'font-styles': false,
                        emphasis: false,
                        list: false,
                        link: false,
                        image: false
                    };
                } else {
                    options.type = 'text';
                    options.tpl = '<textarea/>';
                }

                //todo: format support
                $el
                    .on('init', function (e, editable) {
                        chCardFunction.textAreaInitFunc(e, editable, name, rawEdit, caption, false, this, isMarkupSupport);
                    })
                    .on('shown', function (e, editable) {
                        chFunctions.textShownFunction(e, editable);
                    })
                    .on('save', function (e, params) {
                        chCardFunction.defaultSaveFunc(e, params, name);
                    })
                    .editable(options);
                ////                $options['htmlOptions']['class'] = 'ch-card-iframe';

            };


        },
        isStatic: function () {
            return this.getHeight() === 1;
        }
    });
})();