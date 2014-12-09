var ColumnRO = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            columnProperties: null,
            id: null,
            key: null
        },
        getTemplate: function () {
            var template = ChGridForm.TEMPLATE_TD;
            //todo: видимость перенести в модель, пока что убрана
            //if ($cell.css('display') !== "none") {
                template = template.replace('style', '');
            //} else {
            //    template = template.replace('style', 'style="display:none;"');
            //}
            return template.replace(/\{class\}/g, this.getClass());
        },
        getClass: function () {
            var class_name = '';
            if (!this.isEdit()) {
                class_name += 'not-changed';
            }
            return class_name;
        },

        isEdit: function () {
            return helpersModule.boolEval(this.get('columnProperties').getAllowEdit(), true);
        },
        getJsFn: function ($cnt) {
            return function () {
                //console.log($cnt);
            };
        },
        getEditType: function () {
            return this.get('columnProperties').getEditType();
        },
        initialize: function () {
            this.set('key', this.get('columnProperties').getVisibleKey());
        },
        getHeaderCLass: function () {
            if (this.isRequired()) {
                return 'fa-asterisk';
            }
            return '';
        },
        isVisible: function () {
            return this.isVisibleInAllField() || helpersModule.boolEval(this.get('columnProperties').getVisible(), false);
        },
        isRequired: function () {
            return helpersModule.boolEval(this.get('columnProperties').getRequired(), false);
        },

        getCaption: function () {
            return this.get('columnProperties').getCaption();
        },
        isVisibleInAllField: function () {
            return helpersModule.boolEval(this.get('columnProperties').getAllFields(), false);
        },
        getHeaderOptions: function () {
            var options = {};
            options['data-id'] = this.get('key');
            if (!this.isEdit()) {
                options['data-changed'] = 0;
            }
            if (this.isVisibleInAllField()) {
                options['data-col-hide'] = 1;
            }
            options['class'] = 'sorter-text';
            return options;
        }

    });
})(Backbone, helpersModule, FilterProperties, bindModule);