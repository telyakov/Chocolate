var ColumnRO = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            columnProperties: null,
            id: null,
            key: null
        },
        _column_custom_properties: null,
        getColumnCustomProperties: function () {
            if (this._column_custom_properties === null) {
                this._column_custom_properties = new ColumnCustomProperties({
                        expression: this.get('columnProperties').getProperties()
                    }
                );
            }
            return this._column_custom_properties;
        },
        readProcData: null,
        getSql: function () {
            var sql = this.get('columnProperties').getDataSource();
            if (!sql) {
                sql = this.get('columnProperties').getFromDataSource();
            }
            return sql;
        },
        evalReadProc: function (params) {
            var mainDefer = deferredModule.create(),
                deferId = deferredModule.save(mainDefer);
            if (this.readProcData === null) {
                var _this = this,
                    sql = this.getSql();
                if (sql) {
                    var dataDefer = deferredModule.create(),
                        dateDeferID = deferredModule.save(dataDefer);
                    bindModule.deferredBindSql(dateDeferID, sql, params);
                    dataDefer.done(function (res) {
                        var prepareSql = res.sql;
                        var columnDefer = deferredModule.create(),
                            columnDeferID = deferredModule.save(columnDefer);
                        columnDefer.done(function (data) {
                            _this.readProcData = data;
                            deferredModule.pop(deferId).resolve(data);
                        });
                        mediator.publish(optionsModule.getChannel('socketRequest'), {
                            query: prepareSql,
                            type: optionsModule.getRequestType('deferred'),
                            id: columnDeferID
                        });
                    });
                } else {
                    deferredModule.pop(deferId).resolve({data: {}});
                }
            } else {
                deferredModule.pop(deferId).resolve(this.readProcData);
            }
            return mainDefer;

        },
        isSingle: function () {
            return helpersModule.boolEval(this.get('columnProperties').getSingleValueMode(), false);
        },
        getCardEditType: function () {
            return this.get('columnProperties').getCardEditType();
        },
        getCardKey: function () {
            return this.get('columnProperties').getCardKey();
        },
        getCardX: function () {
            return this.get('columnProperties').getCardX();
        },
        getCardY: function () {
            return this.get('columnProperties').getCardY();
        },
        getCardWidth: function () {
            return helpersModule.intExpressionEval(this.get('columnProperties').getCardWidth(), 1);
        },
        getCardHeight: function () {
            return helpersModule.intExpressionEval(this.get('columnProperties').getCardHeight(), 1);
        },

        getVisibleCaption: function () {
            var caption = this.getCaption();
            return caption || this.get('columnProperties').getHeaderImage() ? caption : this.get('key');
        },
        getFormat: function () {
            return this.get('columnProperties').getFormat();
        },
        getView: function () {
            return this.get('columnProperties').getViewName();
        },
        getFromName: function () {
            return this.get('columnProperties').getFromName();
        },
        getToName: function () {
            return this.get('columnProperties').getToName();
        },
        getFromId: function () {
            return this.get('columnProperties').getFromId();
        },
        getToId: function () {
            return this.get('columnProperties').getToId();
        },
        getTemplate: function (isVisible) {
            var template = [
                '<td style class="{class}{class2}"><div class="table-td"><a data-value="{value}"',
                ' data-pk ="{pk}" rel="{rel}" class="editable"></a></div></td>'
            ].join('');
            if (isVisible) {
                template = template.replace('style', '');
            } else {
                template = template.replace('style', 'style="display:none;"');
            }
            return template.replace(/\{class\}/g, this.getClass());
        },
        getClass: function () {
            var class_name = '';
            if (!this.isEdit()) {
                class_name += 'not-changed';
            }
            return class_name;
        },
        getRawAllowEdit: function () {
            return this.get('columnProperties').getAllowEdit();
        },
        isVisibleInCard: function () {
            return helpersModule.boolEval(this.get('columnProperties').getCardVisible(), false);
        },
        isEdit: function () {
            return helpersModule.boolEval(this.get('columnProperties').getAllowEdit(), true);
        },
        getJsFn: function ($cnt) {
            return function () {
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
        getFromKey: function () {
            return this.get('columnProperties').getKey();
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