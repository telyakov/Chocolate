var FormModel = (function ($, Backbone, mediator, AttachmentColumnRO, ColumnsROCollection, ColumnsRoFactory, Card, CardElementFactory, CardROCollection, CardRO, ActionProperties, AgileFilter, PrintActions, ActionsPropertiesCollection, CardCollections, AgileFiltersCollections, ColumnProperties, ColumnsPropertiesCollection, DataFormProperties, FiltersROCollection, FilterRoFactory, deferredModule, optionsModule, bindModule, helpersModule, MapView, CanvasView, AttachmentView, DiscussionView, GridView) {
    'use strict';
    return Backbone.Model.extend(
        /** @lends FormModel */
        {
            defaults: {
                $xml: null,
                parentModel: null,
                parentId: null
            },
            _columnsCollection: null,
            _dataFormProperties: null,
            _agileFilters: null,
            _actionProperties: null,
            _cardCollection: null,
            _filterRoCollection: null,
            _printActions: null,
            _columnsRoCollection: null,
            _dynamicDefaultValues: {},
            _columnsCardRoCollection: null,
            _preview: null,
            _requiredFields: null,
            destroy: function () {
                if (this._columnsCollection) {
                    this._columnsCollection.each(function (object) {
                        object.destroy();
                    });
                    delete this._columnsCollection;
                }
                if (this._dataFormProperties) {
                    this._dataFormProperties.destroy();
                    delete this._dataFormProperties;
                }
                if (this._agileFilters) {
                    this._agileFilters.destroy();
                    delete this._agileFilters;
                }
                if (this._actionProperties) {
                    this._actionProperties.destroy();
                    delete this._actionProperties;
                }
                if (this._filterRoCollection) {
                    this._filterRoCollection.each(function (object) {
                        object.destroy();
                    });
                    delete this._filterRoCollection;
                }
                delete this._printActions;
                if (this._columnsRoCollection) {
                    this._columnsRoCollection.each(function (object) {
                        object.destroy();
                    });
                    delete this._columnsRoCollection;
                }
                delete this._dynamicDefaultValues;
                if(this._columnsCardRoCollection){
                    this._columnsCardRoCollection.each(function (object) {
                        object.destroy();
                    });
                    delete this._columnsCardRoCollection;
                }
                delete this._preview;
                delete this._requiredFields;
                this.set('$xml', null);
                this.set('parentId', null);
                var parentModel = this.get('parentModel');
                if(parentModel){
                    parentModel.destroy();
                    this.set('parentModel', null);
                }
            },
            getDynamicDefaultValues: function () {
                return this._dynamicDefaultValues;
            },
            setDynamicDefaultValue: function (key, val) {
                this._dynamicDefaultValues[key] = val;
            },
            getRequiredFields: function () {
                if (this._requiredFields === null) {
                    var required = [];
                    this.getColumnsROCollection().each(function (column) {
                        if (column.isRequired()) {
                            required.push(column.get('key'));
                        }
                    });
                    this._requiredFields = required;
                }
                return this._requiredFields;
            },
            getColumnsDefaultValues: function () {
                var defaults = {};
                this.getColumnsROCollection().each(function (column) {
                    var def = column.getDefault();
                    if (def !== '' && def !== null) {
                        defaults[column.get('key')] = def;
                    }
                });
                return $.extend({}, defaults, this.getDynamicDefaultValues());
            },
            hasCardHeader: function () {
                return this.getCardHeaderText() || this.getCardHeaderImage();
            },
            getCardHeaderImage: function () {
                return this.getCardCollection().getHeaderImage();
            },
            getCardHeaderText: function () {
                return this.getCardCollection().getHeader();
            },
            getPrintActions: function () {
                if (this._printActions !== null) {
                    return this._printActions;
                }

                var printActions = new PrintActions({
                    printActionsXml: this.getDataFormProperties().getPrintActionsXml()
                });
                this._printActions = printActions.getActions();
                return this._printActions;
            },
            isAllowAudit: function () {
                return helpersModule.boolEval(this.getDataFormProperties().getAllowAuditButton(), false);
            },
            isSearchColumnVisible: function () {
                return this.getColumnsCollection().length > 10;
            },
            getCreateEmptyProc: function () {
                return this.getDataFormProperties().getCreateEmptyProc();
            },
            deferDefaultData: function () {
                var defer = deferredModule.create(),
                    deferID = deferredModule.save(defer);
                bindModule.deferredBindSql(this.getCreateEmptyProc())
                    .done(function (res) {
                        mediator.publish(optionsModule.getChannel('socketRequest'), {
                            query: res.sql,
                            type: optionsModule.getRequestType('deferred'),
                            id: deferID
                        });
                    });
                return defer;
            },
            getCreateProc: function () {
                return this.getDataFormProperties().getCreateProc();
            },
            getDeleteProc: function () {
                return this.getDataFormProperties().getDeleteProc();
            },
            getUpdateProc: function () {
                var sql = this.getDataFormProperties().getValidationProc();
                if (!sql) {
                    sql = this.getDataFormProperties().getUpdateProc();
                }
                return sql;
            },
            deferCreateProc: function (data) {
                var extendedData = $.extend({}, this.getParamsForBind(), data),
                    sql = this.getCreateProc();
                return bindModule.deferredBindSql(sql, extendedData, true);
            },
            deferUpdateProc: function (data) {
                var extendedData = $.extend({}, this.getParamsForBind(), data),
                    sql = this.getUpdateProc();
                return bindModule.deferredBindSql(sql, extendedData, true);
            },
            deferDeleteProc: function (data) {
                var extendedData = $.extend({}, this.getParamsForBind(), data),
                    sql = this.getDeleteProc();
                return bindModule.deferredBindSql(sql, extendedData, true);
            },
            deferSave: function (data, deletedData) {
                var deferredTasks = [],
                    mainDefer = deferredModule.create(),
                    i,
                    sqlList = [],
                    hasOwn = Object.prototype.hasOwnProperty,
                    paramsForBind = this.getParamsForBind(),
                    defer,
                    currentData,
                    extendedData;
                if (data) {
                    for (i in data) {
                        if (hasOwn.call(data, i)) {
                            var sql;
                            currentData = data[i];
                            extendedData = $.extend({}, paramsForBind, currentData);
                            if (helpersModule.isNewRow(currentData.id)) {
                                defer = this.deferUpdateProc(extendedData);
                            } else {
                                defer = this.deferCreateProc(extendedData);
                            }
                            deferredTasks.push(defer);
                            defer
                                .done(function (res) {
                                    sqlList.push(res.sql);
                                });
                        }
                    }
                }
                if (deletedData) {
                    var deletedID;
                    for (deletedID in deletedData) {
                        if (hasOwn.call(deletedData, deletedID)) {
                            currentData = {id: deletedID};
                            extendedData = $.extend({}, paramsForBind, currentData);
                            defer = this.deferDeleteProc(extendedData);
                            deferredTasks.push(defer);
                            defer
                                .done(function (res) {
                                    sqlList.push(res.sql);
                                });
                        }
                    }
                }
                var mainDeferID = deferredModule.save(mainDefer);
                $.when.apply($, deferredTasks)
                    .done(function () {
                        mediator.publish(optionsModule.getChannel('socketMultiplyExec'), {
                            sqlList: sqlList,
                            type: optionsModule.getRequestType('deferred'),
                            id: mainDeferID
                        });
                    })
                    .fail(function (error) {
                        mainDefer.reject(error);
                    });
                return mainDefer;
            },
            deferReadData: function (sql) {
                var defer = deferredModule.create(),
                    deferID = deferredModule.save(defer);
                mediator.publish(optionsModule.getChannel('socketRequest'), {
                    query: sql,
                    type: optionsModule.getRequestType('chFormRefresh'),
                    id: deferID
                });
                return defer;
            },
            isSupportCreateEmpty: function () {
                return this.getCreateEmptyProc() ? true : false;
            },
            isAutoOpenCard: function () {
                return helpersModule.boolEval(this.getCardCollection().getAutoOpen(), false);
            },
            isAllowCreate: function () {
                return helpersModule.boolEval(this.getDataFormProperties().getAllowAddNew(), false);
            },
            isAllowSave: function () {
                return helpersModule.boolEval(this.getDataFormProperties().getSaveButtonVisible(), false);
            },
            isAllowRefresh: function () {
                return helpersModule.boolEval(this.getDataFormProperties().getRefreshButtonVisible(), false);
            },
            isAllowPrintActions: function () {
                return this.getPrintActions().length > 0;
            },
            getKey: function () {
                return this.getDataFormProperties().getKey();
            },
            getView: function () {
                return this.getKey() + '.xml';
            },
            isCanvasView: function () {
                return this.getKey() === 'sales\\flatsgramm';
            },
            isMapView: function () {
                return this.getKey() === 'crm\\map';
            },
            isAttachmentView: function () {
                return this.getKey() === 'attachmentstasks';
            },
            isDiscussionView: function () {
                return this.getKey() === 'directory\\discussions';
            },
            isNotSaved: function () {
                var parentID = this.get('parentId');
                return parentID && !helpersModule.isNewRow(parentID);
            },
            getFormView: function () {
                switch (true) {
                    case this.isMapView():
                        return MapView;
                    case this.isCanvasView():
                        return CanvasView;
                    case this.isAttachmentView():
                        return AttachmentView;
                    case this.isDiscussionView():
                        return DiscussionView;
                    default :
                        return GridView;
                }
            },
            getColumnsCollection: function () {
                if (this._columnsCollection) {
                    return this._columnsCollection;
                }
                var columns = [],
                    $xml = this.get('$xml');
                if ($xml) {
                    var $gridLayout = $xml.find('GridLayoutXml'),
                        $columns = $($.parseXML($.trim($gridLayout.text()))),
                        $gridProperties = $columns.find('GridProperties');
                    $columns.find('Column').each(function () {
                        columns.push(new ColumnProperties({
                                $obj: $(this)
                            }
                        ));
                    });
                    this._columnsCollection = new ColumnsPropertiesCollection(columns, {
                        $obj: $gridProperties
                    });

                }
                return this._columnsCollection;
            },
            getDataFormProperties: function () {
                if (this._dataFormProperties) {
                    return this._dataFormProperties;
                }

                var $xml = this.get('$xml');
                if ($xml) {
                    this._dataFormProperties = new DataFormProperties({
                        $obj: $xml.find('DataFormProperties')
                    });
                }
                return this._dataFormProperties;
            },
            getFiltersCollections: function () {
                if (this._agileFilters) {
                    return this._agileFilters;
                }
                var filters = [],
                    $xml = this.get('$xml');
                if ($xml) {
                    var $filtersPanel = $xml.find('FiltersPanelXml'),
                        $filters = $($.parseXML($.trim($filtersPanel.text()))),
                        $agileFilters = $filters.find('AgileFilters');
                    $agileFilters.find('AgileFilter').each(function () {
                        filters.push(new AgileFilter({
                                $obj: $(this)
                            }
                        ));
                    });
                    this._agileFilters = new AgileFiltersCollections(filters, {
                        $obj: $agileFilters
                    });
                }
                return this._agileFilters;

            },
            getActionProperties: function () {
                if (this._actionProperties) {
                    return this._actionProperties;
                }
                var actions = [],
                    $xml = this.get('$xml');
                if ($xml) {
                    var $actions = $xml.find('ActionsXml');
                    $actions = $($.parseXML($.trim($actions.text())));
                    $actions.find('MenuAction').each(function () {
                        actions.push(new ActionProperties({
                                $obj: $(this)
                            }
                        ));
                    });
                    this._actionProperties = new ActionsPropertiesCollection(actions);
                }
                return this._actionProperties;
            },
            hasCard: function () {
                return this.getCardCollection().length > 0;
            },
            getCardCollection: function () {
                if (this._cardCollection) {
                    return this._cardCollection;
                }
                var cards = [],
                    $xml = this.get('$xml');
                if ($xml) {
                    var $cards = $xml.find('Cards');
                    $cards = $($.parseXML($.trim($cards.text())));
                    $cards.find('Card').each(function () {
                        cards.push(new Card({
                                $obj: $(this)
                            }
                        ));
                    });
                    this._cardCollection = new CardCollections(cards, {
                        $obj: $cards.children('Cards').children('Style')
                    });
                }
                return this._cardCollection;
            },
            getCardROCollection: function () {
                var collection = new CardROCollection();
                this.getCardCollection().each(function (card) {
                    var cardRO = new CardRO({
                        card: card,
                        key: card.getKey()
                    });
                    if (cardRO.isVisible()) {
                        collection.push(cardRO);
                    }
                });
                return collection;
            },
            getCardElements: function (card, view) {
                var key = card.getKey(),
                    cardElements = [],
                    collection = this.getColumnsCardROCollection(),
                    _this = this;
                collection.each(function (model) {
                    if (model.getCardKey() === key) {
                        var elem = CardElementFactory.make(model, collection, _this, view);
                        cardElements.push(elem);
                    }
                });
                return new Backbone.Collection(cardElements);
            },
            getCardTabCaption: function () {
                return this.getCardCollection().getCaption();
            },
            getCaption: function () {
                return this.getDataFormProperties().getWindowCaption();
            },
            hasHeader: function () {
                var dataFormProperties = this.getDataFormProperties();
                return dataFormProperties.getHeaderText() ||
                dataFormProperties.getHeaderImage() ||
                dataFormProperties.getStateProc();
            },
            getImage: function () {
                return this.getDataFormProperties().getHeaderImage();
            },
            getHeaderText: function () {
                return this.getDataFormProperties().getHeaderText();
            },
            getStateProc: function () {
                return this.getDataFormProperties().getStateProc();
            },
            hasFilters: function () {
                return this.getFiltersCollections().length !== 0 && !this.isDiscussionView();
            },
            getFiltersROCollection: function (view) {
                if (this._filterRoCollection !== null) {
                    return this._filterRoCollection;
                }
                var filtersCollection = this.getFiltersCollections(),
                    filtersROCollection = new FiltersROCollection();
                filtersCollection.each(function (item) {
                    filtersROCollection.push(FilterRoFactory.make(item, view));
                });
                this._filterRoCollection = filtersROCollection;
                return this._filterRoCollection;
            },
            getColumnsROCollection: function () {
                if (this._columnsRoCollection !== null) {
                    return this._columnsRoCollection;
                }
                var columnsCollection = this.getColumnsCollection(),
                    columnsROCollection = new ColumnsROCollection();
                columnsCollection.each(function (item) {
                    var columnRO = ColumnsRoFactory.make(item);
                    if (columnRO.isVisible()) {
                        columnsROCollection.push(columnRO);
                    }
                });
                this._columnsRoCollection = columnsROCollection;
                if (this.isAttachmentSupport()) {
                    columnsROCollection.push(new AttachmentColumnRO());
                }
                return this._columnsRoCollection;
            },
            getColumnsCardROCollection: function () {
                if (this._columnsCardRoCollection !== null) {
                    return this._columnsCardRoCollection;
                }
                var columnsCollection = this.getColumnsCollection(),
                    columnsROCollection = new ColumnsROCollection();
                columnsCollection.each(function (item) {
                    var columnRO = ColumnsRoFactory.make(item);
                    if (columnRO.isVisibleInCard()) {
                        columnsROCollection.push(columnRO);
                    }
                });
                this._columnsCardRoCollection = columnsROCollection;
                return this._columnsCardRoCollection;
            },
            isAttachmentSupport: function () {
                return helpersModule.boolEval(this.getDataFormProperties().getAttachmentsSupport(), false);
            },
            getEntityTypeID: function () {
                return this.getDataFormProperties().getAttachmentsEntityType();
            },
            getParentEntityTypeID: function () {
                var parentModel = this.get('parentModel');
                if (parentModel) {
                    return parentModel.getEntityTypeID();
                } else {
                    return null;
                }
            },
            getParentView: function () {
                var parentModel = this.get('parentModel');
                if (parentModel) {
                    return parentModel.getView();
                } else {
                    return null;
                }
            },
            getParamsForBind: function (pk) {
                return {
                    entityid: pk ? pk : this.get('parentId'),
                    parentid: pk ? pk : this.get('parentId'),
                    entitytype: this.getParentEntityTypeID(),
                    entitytypeid: this.getParentEntityTypeID(),
                    parententitytypeid: this.getParentEntityTypeID(),
                    parententitytype: this.getParentEntityTypeID()
                };
            },
            deferReadProc: function (filterData, mainSql) {
                var data = this.getParamsForBind();
                if (filterData) {
                    data = $.extend(data, filterData);
                }
                var sql;
                if (mainSql) {
                    sql = mainSql;
                } else {
                    sql = this.getDataFormProperties().getReadProc();
                }
                return bindModule.deferredBindSql(sql, data);
            },
            getPreview: function () {
                if (this._preview === null) {
                    var preview = {};
                    this.getColumnsCollection().each(function (column) {
                        if (helpersModule.boolEval(column.getShowInRowDisplay())) {
                            preview[column.getKey()] = {
                                caption: column.getCaption(),
                                type: ['date', 'datetime'].indexOf(column.getEditType()) === -1 ?
                                    's' :
                                    'dt'
                            };
                        }
                    });
                    this._preview = preview;
                }
                return this._preview;

            },
            getKeyColorColumnName: function () {
                return this.getColumnsCollection().getRowColorColumnName();
            },
            getColorColumnName: function () {
                return this.getColumnsCollection().getRowColorColumnNameAlternate();
            }

        });
})(jQuery, Backbone, mediator, AttachmentColumnRO, ColumnsROCollection, ColumnsRoFactory, Card, CardElementFactory, CardROCollection, CardRO, ActionProperties, AgileFilter, PrintActions, ActionsPropertiesCollection, CardCollections, AgileFiltersCollections, ColumnProperties, ColumnsPropertiesCollection, DataFormProperties, FiltersROCollection, FilterRoFactory, deferredModule, optionsModule, bindModule, helpersModule, MapView, CanvasView, AttachmentView, DiscussionView, GridView);
