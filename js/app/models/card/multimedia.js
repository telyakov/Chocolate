/**
 * Class MultimediaCardElement
 * @class
 * @augments CardElement
 */
var MultimediaCardElement = (function (bindModule, optionsModule, jsonParse, CardElement, helpersModule, mediator) {
    'use strict';
    return CardElement.extend(
        /** @lends MultimediaCardElement */

        {
            /**
             * @override
             * @protected
             * @returns {number}
             */
            _getMinHeight: function () {
                return 300;
            },
            /**
             * @override
             * @protected
             * @returns {Boolean}
             */
            _isStatic: function () {
                return false;
            },
            /**
             * @override
             * @protected
             * @returns {String}
             */
            _renderBeginData: function () {
                return '<div class="card-input card-grid' + this.getEditClass() + '">';
            },
            /**
             * @override
             * @protected
             * @returns {String}
             */
            _renderControl: function (pk, controlID) {
                return '<div class="card-multimedia" id=' + controlID + '></div>';
            },
            /**
             * @override
             * @protected
             * @returns {String}
             */
            _renderLabel: function () {
                return '';
            },
            /**
             * @override
             * @param controlID {String}
             * @param pk {String}
             * @returns {Function}
             * @protected
             */
            _getCallback: function (controlID, pk) {
                var column = this.get('column'),
                    model = this.get('model');
                return function () {
                    var sql = column.getSql();
                    bindModule.runAsyncTaskBindSql(sql, model.getParamsForBind(pk))
                        .done(function (res) {
                            $.get(optionsModule.getUrl('imagesUrls'), {sql: res.sql})
                                .done(function (response) {
                                    var data = jsonParse(response, helpersModule.parse);
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