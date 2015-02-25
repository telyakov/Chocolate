/**
 * Class FormCardElement
 * @class
 * @augments CardElement
 */
var FormCardElement = (function ($, optionsModule, helpersModule, deferredModule, mediator, CardElement) {
    'use strict';
    return CardElement.extend(
        /** @lends FormCardElement */
        {
            /**
             * @param {Object} opts
             * @constructs
             * @augments CardElement
             */
            initialize: function (opts) {
                this._model = null;
                this._view = null;
                this.constructor.__super__.initialize.call(this, opts);
            },
            /**
             * @method destroy
             * @override
             */
            destroy: function () {
                if (this._view) {
                    this._view = null;
                }
                if (this._model) {
                    this._model = null;
                }
                this.constructor.__super__.destroy.apply(this, arguments);
            },
            /**
             * @override
             * @protected
             * @returns {number}
             */
            _getMinHeight: function () {
                return 215;
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
                return '<div class="card-input card-grid ' + this.getEditClass() + '">';
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
             * @protected
             * @returns {String}
             */
            _renderControl: function (pk, controlID, tabindex) {
                return '<section id="' + controlID + '"></section>';
            },
            /**
             * @override
             * @param controlID {String}
             * @param pk {String}
             * @returns {Function}
             * @protected
             */
            _getCallback: function (controlID, pk) {
                var _this = this,
                    column = _this.getColumn();
                return function () {
                    var asyncTask = deferredModule.create(),
                        data = {
                            type: optionsModule.getRequestType('deferred'),
                            name: helpersModule.getCorrectXmlName(column.getView()),
                            id: deferredModule.save(asyncTask)
                        };
                    mediator.publish(optionsModule.getChannel('xmlRequest'), data);
                    asyncTask.done(function (res) {
                        var $xml = res.data,
                            model = new FormModel({
                                $xml: $xml,
                                parentModel: _this.get('model'),
                                parentId: pk
                            });
                        var view = new FormView({
                            $card: $('#' + controlID),
                            model: model,
                            card: _this
                        });
                        view.render();
                        _this._persistReferenceToModel(model);
                        _this._persistReferenceToView(view);
                    });
                };
            },
            /**
             *
             * @param {FormModel} model
             * @private
             */
            _persistReferenceToModel: function (model) {
                this._model = model
            },
            /**
             *
             * @param {FormView} view
             * @private
             */
            _persistReferenceToView: function (view) {
                this._view = view
            }
        });
})(jQuery, optionsModule, helpersModule, deferredModule, mediator, CardElement);