/**
 * Class MultimediaCardElement
 * @class
 * @augments CardElement
 */
var MultimediaCardElement = (function (bindModule, optionsModule, CardElement, helpersModule, mediator) {
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
                            var asyncTask = deferredModule.create();
                            mediator.publish(optionsModule.getChannel('socketRequest'), {
                                query: res.sql,
                                type: optionsModule.getRequestType('deferred'),
                                id: deferredModule.save(asyncTask),
                                isCache: true
                            });
                            var result = [];
                            asyncTask
                                .done(
                                /** @param {RecordsetDTO} res */
                                    function (res) {
                                    var idList = Object.keys(res.data);


                                    async.each(idList, function (fileID, callback) {
                                        var asyncTask = deferredModule.create();
                                        mediator.publish(optionsModule.getChannel('socketFileRequest'), {
                                            id: deferredModule.save(asyncTask),
                                            fileID: fileID,
                                            type: optionsModule.getRequestType('deferred')
                                        });
                                        asyncTask
                                            .done(
                                            /** @param {FileDTO} res */
                                                function (res) {
                                                result.push(helpersModule.arrayBufferToBase64(res.data));
                                                callback();
                                            })
                                            .fail(function (error) {
                                                mediator.publish(optionsModule.getChannel('logError'), error);
                                                callback();
                                            });


                                    }, function () {
                                        if (result.length) {
                                        var $context = $('#' + controlID),
                                            html = [],
                                            isFirst = true;
                                            result.forEach(function (blobData) {
                                            if (isFirst) {
                                                html.push('<a class="fancybox multimedia-main-image" rel="gallery"><img src="data:image/jpg;base64,' + blobData + '"></img></a>');
                                                isFirst = false;
                                            } else {
                                                html.push('<a class="fancybox multimedia-image" rel="gallery" style="display:none"><img src="data:image/jpg;base64,' + blobData + '"></img></a>');
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
                                    });


                                })
                                .fail(function (error) {
                                    mediator.publish(optionsModule.getChannel('logError'), error);
                                })
                        });
                };
            }
        });
})(bindModule, optionsModule, CardElement, helpersModule, mediator);