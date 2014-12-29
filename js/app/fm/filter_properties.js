var FilterProperties = (function (Backbone) {
    'use strict';
    return Backbone.Model.extend({
        constructor: function () {
            Backbone.Model.apply(this, arguments);
            this.init();
        },
        defaults: {
            expression: null,
            delimiter: '|',
            rightPanelDataSource: [],
            selectAllNodes: false,
            expandNodes: true,
            restoreState: true,
            parentFilter: null,
            isAutoRefresh: false,
            columnID: 'id',
            columnParentID: 'parentid',
            columnTitle: 'name',
            rootID: 'root'
        },
        init: function () {
            var expression = this.get('expression');
            if (expression) {
                var _this = this,
                    properties = expression.split(this.get('delimiter'));
                properties.forEach(function (prop) {
                    var propInLower = prop.toLowerCase();
                    switch (true) {
                        case propInLower.indexOf('rightpaneldatasource') !== -1:
                            break;
                        case propInLower.indexOf('allowselectallnodes') !== -1:
                            _this.set('selectAllNodes', true);
                            break;
                        case propInLower.indexOf('lockexpandnodes') !== -1:
                            _this.set('expandNodes', false);
                            break;
                        case propInLower.indexOf('lockrestorestate') !== -1:
                            _this.set('restoreState', false);
                            break;
                        case propInLower.indexOf('parentfilter') !== -1:
                            if (prop.indexOf('=') !== -1) {
                                var tokens = prop.split('=');
                                _this.set('parentFilter', tokens[1].toLowerCase());
                            }
                            break;
                        case propInLower.indexOf('autoRefresh') !== -1:
                            _this.set('isAutoRefresh', true);
                            break;
                        default:
                            break;
                    }
                });
            }
        }
    });
})(Backbone);