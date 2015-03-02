/**
 * @class
 * @augments Backbone.Model
 */
var ColumnRO = (function (Backbone, helpersModule, FilterProperties, bindModule, deferredModule, optionsModule, undefined) {
    'use strict';
    return Backbone.Model.extend(
        /** @lends ColumnRO */
        {
            defaults: {
                columnProperties: null,
                id: null,
                key: null
            },
            _columnCustomProperties: null,
            _readData: null,
            /**
             * @constructs
             * @private
             */
            initialize: function () {
                this.set('key', this._getColumnProperties().getVisibleKey());
            },
            /**
             * @returns {boolean}
             */
            isValueListType: function () {
                return this.getEditType().indexOf('valuelist') !== -1
            },
            /**
             * @returns {ColumnProperties}
             * @private
             */
            _getColumnProperties: function () {
                return this.get('columnProperties');
            },
            /**
             * @returns {ColumnCustomProperties}
             */
            getColumnCustomProperties: function () {
                if (this._columnCustomProperties === null) {
                    this._columnCustomProperties = new ColumnCustomProperties({
                            expression: this._getColumnProperties().getProperties()
                        }
                    );
                }
                return this._columnCustomProperties;
            },
            /**
             * @returns {String}
             */
            getSql: function () {
                var sql = this._getColumnProperties().getDataSource();
                if (!sql) {
                    sql = this._getColumnProperties().getFromDataSource();
                }
                return sql;
            },
            /**
             * @param {FormModel} model
             * @returns {string|null}
             */
            getDefault: function (model) {
                return interpreterModule.parseDefaultExpression(this._getColumnProperties().getDefault(), model);
            },
            /**
             * @method destroy
             */
            destroy: function () {
                this._getColumnProperties().destroy();
                delete this._readData;
                delete this._columnCustomProperties;
                this.set('columnProperties', null);
                this.set('id', null);
                this.set('key', null);
            },
            /**
             * @param {Object} [params]
             * @returns {Deferred}
             */
            startAsyncTaskGetData: function (params) {
                var mainDefer = deferredModule.create(),
                    deferId = deferredModule.save(mainDefer);
                if (this._readData === null) {
                    var _this = this,
                        sql = this.getSql();
                    if (sql) {
                        var dataDefer = bindModule.runAsyncTaskBindSql(sql, params);
                        dataDefer.done(function (res) {
                            var prepareSql = res.sql;
                            var columnDefer = deferredModule.create(),
                                columnDeferID = deferredModule.save(columnDefer);
                            columnDefer.done(function (data) {
                                _this._readData = data;
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
                    deferredModule.pop(deferId).resolve(this._readData);
                }
                return mainDefer;
            },
            /**
             * @returns {Boolean}
             */
            isSingle: function () {
                return interpreterModule.parseBooleanExpression(this._getColumnProperties().getSingleValueMode(), false);
            },
            /**
             * @returns {String}
             */
            getCardEditType: function () {
                return this._getColumnProperties().getCardEditType();
            },
            /**
             * @returns {String}
             */
            getCardKey: function () {
                return this._getColumnProperties().getCardKey();
            },
            /**
             * @returns {String}
             */
            getCardX: function () {
                return this._getColumnProperties().getCardX();
            },
            /**
             * @returns {String}
             */
            getCardY: function () {
                return this._getColumnProperties().getCardY();
            },
            /**
             * @returns {Number|String}
             */
            getCardWidth: function () {
                var width = interpreterModule.parseIntExpression(this._getColumnProperties().getCardWidth());
                if(width === ''){
                    return 1;
                }
                return  width;
            },
            /**
             * @returns {Number|String}
             */
            getCardHeight: function () {
                var height = interpreterModule.parseIntExpression(this._getColumnProperties().getCardHeight());
                if(height === ''){
                    return 1;
                }
                return height;
            },
            /**
             * @returns {String}
             */
            getVisibleCaption: function () {
                var caption = this.getCaption();
                return caption || this._getColumnProperties().getHeaderImage() ? caption : this.get('key');
            },
            /**
             * @returns {String}
             */
            getFormat: function () {
                return this._getColumnProperties().getFormat();
            },
            /**
             * @returns {String}
             */
            getView: function () {
                return this._getColumnProperties().getViewName();
            },
            /**
             * @returns {String}
             */
            getFromName: function () {
                return this._getColumnProperties().getFromName();
            },
            /**
             * @returns {String}
             */
            getToName: function () {
                return this._getColumnProperties().getToName();
            },
            /**
             * @returns {String}
             */
            getFromId: function () {
                return this._getColumnProperties().getFromId();
            },
            /**
             * @returns {String}
             */
            getToId: function () {
                return this._getColumnProperties().getToId();
            },
            /**
             * @param $col {jQuery}
             */
            markAsNoChanged: function ($col) {
                $col.closest('td').addClass(optionsModule.getClass('notChanged'));
            },
            /**
             * @param view {AbstractView}
             * @param pk {String}
             * @returns {boolean}
             */
            isAllowEdit: function (view, pk) {
                var data = view.model.getActualDataFromStorage(pk),
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
            /**
             * @param {String} id
             * @param {Boolean} isVisible
             * @param {String} value
             * @param {String} [color]
             * @returns {string}
             */
            getTemplate: function (id, isVisible, value, color) {
                var html = ['<td '];
                if (!isVisible) {
                    html.push('style="display:none;"');
                }
                html.push(' class="');
                html.push(this.getClass());
                html.push('"><div class="table-td"><a data-value="');
                html.push(value);
                html.push('" data-pk ="');
                html.push(id);
                if (color) {
                    html.push('" style="color:#');
                    html.push(color);
                }
                html.push('" class="editable ');
                html.push(this._getUniqueClass());
                html.push('"></a></div></td>');
                return html.join('');
            },
            /**
             * @returns {string}
             */
            getClass: function () {
                var className = '';
                if (!this.isEdit()) {
                    className += 'not-changed';
                }
                return className;
            },
            /**
             * @returns {String}
             */
            getRawAllowEdit: function () {
                return this._getColumnProperties().getAllowEdit();
            },
            /**
             * @returns {Boolean}
             */
            isVisibleInCard: function () {
                return interpreterModule.parseBooleanExpression(this._getColumnProperties().getCardVisible(), false);
            },
            /**
             * @returns {Boolean}
             */
            isEdit: function () {
                return interpreterModule.parseBooleanExpression(this._getColumnProperties().getAllowEdit(), true);
            },
            /**
             * @returns {Function}
             */
            getJsFn: function () {
                return function () {
                };
            },
            /**
             * @param pk {String}
             * @returns {String}
             */
            getModalTitle: function (pk) {
                if (helpersModule.isNewRow(pk)) {
                    return this.getVisibleCaption();
                } else {
                    return this.getVisibleCaption() + ' [' + pk + ']';
                }
            },
            /**
             * @returns {String}
             */
            getEditType: function () {
                return this._getColumnProperties().getEditType();
            },
            /**
             * @returns {string}
             */
            getHeaderCLass: function () {
                if (this.isRequired()) {
                    return 'fa-asterisk';
                }
                return '';
            },
            /**
             * @returns {Boolean}
             */
            isVisible: function () {
                return this._isVisibleInAllField() || interpreterModule.parseBooleanExpression(this._getColumnProperties().getVisible(), false);
            },
            /**
             * @returns {Boolean}
             */
            isRequired: function () {
                return interpreterModule.parseBooleanExpression(this._getColumnProperties().getRequired(), false);
            },
            /**
             * @returns {String}
             */
            getFromKey: function () {
                return this._getColumnProperties().getKey();
            },
            /**
             * @returns {String}
             */
            getCaption: function () {
                return this._getColumnProperties().getCaption();
            },
            /**
             * @returns {Object}
             */
            getHeaderOptions: function () {
                var options = {};
                options['data-id'] = this.get('key');
                if (!this.isEdit()) {
                    options['data-changed'] = 0;
                }
                if (this._isVisibleInAllField()) {
                    options['data-col-hide'] = 1;
                }
                options['class'] = 'sorter-text';
                return options;
            },
            /**
             * @returns {Boolean}
             * @protected
             */
            _isVisibleInAllField: function () {
                return interpreterModule.parseBooleanExpression(this._getColumnProperties().getAllFields(), false);
            },
            /**
             * @returns {String}
             * @protected
             */
            _getUniqueClass: function () {
                return helpersModule.uniqueColumnClass(this.get('key'));
            }
        });
})(Backbone, helpersModule, FilterProperties, bindModule, deferredModule, optionsModule, undefined);