var ColumnCustomProperties = (function (Backbone, helpersModule) {
    'use strict';
    return Backbone.Model.extend(
        /** @lends ColumnCustomProperties */
        {
            defaults: {
                expression: null,
                propDelimiter: '|',
                valueDelimiter: '=',
                label: 'check',
                color: null,
                priority: 1,
                markupSupport: false
            },
            /**
             *  @constructs
             *  @private
             *  @extends Backbone.Model
             *  */
            initialize: function () {
                var expression = this.get('expression'),
                    properties = expression.split(this.get('propDelimiter')),
                    valueDelimiter = this.get('valueDelimiter'),
                    _this = this;
                properties.forEach(function (property) {
                    var propertyInLowerCase = property.toLowerCase(),
                        tokens;
                    switch (true) {
                        case propertyInLowerCase.indexOf('label') !== -1:
                            tokens = property.split(valueDelimiter);
                            if (tokens.length === 2) {
                                _this.set('label', tokens[1]);
                            }
                            break;
                        case propertyInLowerCase.indexOf('color') !== -1:
                            tokens = property.split(valueDelimiter);
                            if (tokens.length === 2) {
                                var hex = helpersModule.decToHeh(tokens[1]);
                                _this.set('color', hex);
                            }
                            break;
                        case propertyInLowerCase.indexOf('priority') !== -1:
                            tokens = property.split(valueDelimiter);
                            if (tokens.length === 2) {
                                _this.set('priority', tokens[1]);
                            }
                            break;
                        case propertyInLowerCase.indexOf('markupsupport') !== -1:
                            _this.set('markupSupport', true);
                            break;
                        default:
                            break;
                    }
                });
            }
        });
})(Backbone, helpersModule);