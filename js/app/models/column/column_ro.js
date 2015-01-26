var ColumnRO = (function (Backbone, helpersModule, FilterProperties, bindModule, deferredModule, optionsModule, undefined) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            columnProperties: null,
            id: null,
            key: null
        },
        initialize: function () {
            this.set('key', this.get('columnProperties').getVisibleKey());
        },
        _columnCustomProperties: null,
        getColumnCustomProperties: function () {
            if (this._columnCustomProperties === null) {
                this._columnCustomProperties = new ColumnCustomProperties({
                        expression: this.get('columnProperties').getProperties()
                    }
                );
            }
            return this._columnCustomProperties;
        },
        getSql: function () {
            var sql = this.get('columnProperties').getDataSource();
            if (!sql) {
                sql = this.get('columnProperties').getFromDataSource();
            }
            return sql;
        },
        getDefault: function () {
            return helpersModule.defaultExpressionEval(this.get('columnProperties').getDefault());
        },
        destroy: function () {
            delete this.readProcData;
            delete this._columnCustomProperties;
            this.set('columnProperties', null);
            this.set('id', null);
            this.set('key', null);
        },
        readProcData: null,
        evalReadProc: function (params) {
            var mainDefer = deferredModule.create(),
                deferId = deferredModule.save(mainDefer);
            if (this.readProcData === null) {
                var _this = this,
                    sql = this.getSql();
                if (sql) {
                    var dataDefer = bindModule.deferredBindSql(sql, params);
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
                            id: columnDeferID,
                            isCache: true
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
        markAsNoChanged: function ($col) {
            $col.closest('td').addClass(optionsModule.getClass('notChanged'));
        },
        isAllowEdit: function (view, pk) {
            var data = view.getDBDataFromStorage(pk),
                isAllowEdit = false,
                allowEditLC = this.getRawAllowEdit().toLowerCase();
            if (allowEditLC.indexOf('|') !== -1 || allowEditLC.indexOf('editable') !== -1 || allowEditLC.indexOf('role') !== -1) {
                var tokens = allowEditLC.split('|');
                tokens.forEach(function (token) {
                    if (!isAllowEdit) {
                        var parts = token.split('='),
                            type = parts[0],
                            value = parts[1];
                        switch (type) {
                            case 'editable':
                                if (data !== undefined && data.editable === value) {
                                    isAllowEdit = true;
                                }
                                break;
                            case 'role':
                                if (facade.getUserModule().hasRole(value)) {
                                    isAllowEdit = true;
                                }
                                break;
                        }
                    }
                });
            } else {
                switch (allowEditLC) {
                    case 'true':
                        isAllowEdit = true;
                        break;
                    case 'false':
                        isAllowEdit = false;
                        break;
                    case '1':
                        isAllowEdit = true;
                }
            }
            return isAllowEdit;
        },
        getUniqueClass: function () {
            return helpersModule.uniqueColumnClass(this.get('key'));
        },
        getTemplate: function (isVisible) {
            var template = [
                '<td style class="' + this.getClass() + ' {class}"><div class="table-td"><a data-value="{value}"',
                ' data-pk ="{pk}"  class="editable ' + this.getUniqueClass() + '"></a></div></td>'
            ].join('');
            if (isVisible) {
                template = template.replace('style', '');
            } else {
                template = template.replace('style', 'style="display:none;"');
            }
            return template;
        },
        getClass: function () {
            var className = '';
            if (!this.isEdit()) {
                className += 'not-changed';
            }
            return className;
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
        getJsFn: function () {
            return function () {
            };
        },
        getModalTitle: function (pk) {
            if ($.isNumeric(pk)) {
                return this.getVisibleCaption() + ' [' + pk + ']';
            } else {
                return this.getVisibleCaption();
            }
        },
        getEditType: function () {
            return this.get('columnProperties').getEditType();
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
})(Backbone, helpersModule, FilterProperties, bindModule, deferredModule, optionsModule, undefined);