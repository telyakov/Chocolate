var MultimediaCardElement = (function (bindModule, optionsModule, json_parse, CardElement, helpersModule, mediator) {
    'use strict';
    return CardElement.extend({
        getMinHeight: function () {
            return 300;
        },
        isStatic: function () {
            return false;
        },
        renderBeginData: function () {
            return '<div class="card-input card-grid' + this.getEditClass() + '">';
        },
        renderControl: function (pk, controlID, tabindex) {
            return '<div class="card-multimedia" id=' + controlID + '></div>';
        },
        renderLabel: function () {
            return '';
        },
        getCallback: function (controlID, pk) {
            var column = this.get('column'),
                model = this.get('model');
            return function () {
                var sql = column.getSql();
                bindModule.deferredBindSql(sql, model.getParamsForBind(pk))
                    .done(function (res) {
                        $.get(optionsModule.getUrl('imagesUrls'), {sql: res.sql})
                            .done(function (response) {
                                var data = json_parse(response, helpersModule.parse).data;
                                if (data.length) {
                                    var $context = $('#' + controlID),
                                        html = [],
                                        isFirst = true;
                                    data.forEach(function (url) {
                                        if (isFirst) {
                                            html.push('<a class="fancybox multimedia-main-image" rel="gallery"><img src="' + url + '"></img></a>');
                                            isFirst = false;
                                        } else {
                                            html.push('<a class="fancybox multimedia-image" rel="gallery" style="display:none"><img src="' + url + '"></img></a>');
                                        }
                                    });
                                    $context.append(html.join(''));
                                    $context
                                        .find('.fancybox')
                                        .fancybox({
                                            live: false,
                                            maxWidth: 800,
                                            maxHeight: 600,
                                            closeClick: false,
                                            openEffect: 'none',
                                            closeEffect: 'none'
                                        });
                                }
                            })
                            .fail(function (jqXHR, textStatus, errorThrown) {
                                mediator.publish(
                                    optionsModule.getChannel('logError'),
                                    {
                                        jqXHR: jqXHR,
                                        textStatus: textStatus,
                                        errorThrown: errorThrown
                                    }
                                );
                            });
                    });
            };
        }
    });
})(bindModule, optionsModule, json_parse, CardElement, helpersModule, mediator);