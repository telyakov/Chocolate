/**
 * @class FormModel
 * @augments Backbone.Model
 */
var FormModel = (function (storageModule, $, Backbone, mediator, AttachmentColumnRO, ColumnsROCollection, ColumnsRoFactory, Card, CardElementFactory, CardROCollection, CardRO, ActionProperties, AgileFilter, PrintActions, ActionsPropertiesCollection, CardCollections, AgileFiltersCollections, ColumnProperties, ColumnsPropertiesCollection, DataFormProperties, FiltersROCollection, FilterRoFactory, deferredModule, optionsModule, bindModule, helpersModule, MapView, CanvasView, AttachmentView, DiscussionView, GridView) {
    'use strict';
    return Backbone.Model.extend(
        /** @lends FormModel */
        {
            defaults: {
                $xml: null,
                write: false,
                parentModel: null,
                parentId: null
            },
            /**
             * @abstract
             * @class FormModel
             * @augments Backbone.Model
             * @param {Object} opts
             * @constructs
             */
            initialize: function (opts) {
                this._columnsCollection = null;
                this._allColumnsRoCollection = null;
                this._dataFormProperties = null;
                this._agileFilters = null;
                this._actionProperties = null;
                this._cardCollection = null;
                this._filterRoCollection = null;
                this._printActions = null;
                this._columnsRoCollection = null;
                this._dynamicDefaultValues = {};
                this._columnsCardRoCollection = null;
                this._preview = null;
                this._requiredFields = null;
                this._openedCards = [];
            },
            /**
             * @desc get access to write if form
             * @returns {Boolean}
             */
            isAllowWrite: function () {
                var parentModel = this.get('parentModel');
                if (parentModel) {
                    return parentModel.isAllowWrite();
                }
                return this.get('write');
            },
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
                if (this._columnsCardRoCollection) {
                    this._columnsCardRoCollection.each(function (object) {
                        object.destroy();
                    });
                    delete this._columnsCardRoCollection;
                }
                if (this._allColumnsRoCollection) {
                    this._allColumnsRoCollection.each(function (object) {
                        object.destroy();
                    });
                    delete this._allColumnsRoCollection;
                }

                if (this._cardCollection) {
                    this._cardCollection.each(function (object) {
                        object.destroy();
                    });
                    delete this._cardCollection;
                }
                delete this._preview;
                delete this._requiredFields;
                this.set('$xml', null);
                this.set('parentId', null);
                //var parentModel = this.get('parentModel');
                //if(parentModel){
                //TODO: запретить вобще закрытие родительской сушности, пока открыты дочернии
                //    parentModel.destroy();
                //    this.set('parentModel', null);
                //}
                delete this._openedCards;
                storageModule.removeFromSession(this.cid);
            },
            getDynamicDefaultValues: function () {
                return this._dynamicDefaultValues;
            },
            /**
             *
             * @param {string} key
             * @param {string} val
             */
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
            /**
             * @returns {ColumnsROCollection}
             */
            _getAllColumnsROCollection: function () {
                if (this._allColumnsRoCollection !== null) {
                    return this._allColumnsRoCollection;
                }
                var columnsCollection = this.getColumnsCollection(),
                    columnsROCollection = new ColumnsROCollection();
                columnsCollection.each(function (item) {
                    var columnRO = ColumnsRoFactory.make(item);
                    columnsROCollection.push(columnRO);
                });
                this._allColumnsRoCollection = columnsROCollection;
                if (this.isAttachmentSupport()) {
                    columnsROCollection.push(new AttachmentColumnRO());
                }
                return this._allColumnsRoCollection;
            },
            /**
             *
             * @returns {Object}
             */
            getColumnsDefaultValues: function () {
                var defaults = {};
                this._getAllColumnsROCollection().each(function (column) {
                    var def = column.getDefault();
                    if (def !== '' && def !== null) {
                        defaults[column.getFromKey()] = def;
                    }
                });
                return $.extend({}, defaults, this.getDynamicDefaultValues());
            },
            /**
             * @returns {String}
             */
            hasCardHeader: function () {
                return this.getCardHeaderText() || this.getCardHeaderImage();
            },
            /**
             *
             * @returns {String}
             */
            getCardHeaderImage: function () {
                return this.getCardCollection().getHeaderImage();
            },
            /**
             * @returns {String}
             */
            getCardHeaderText: function () {
                return this.getCardCollection().getHeader();
            },
            /**
             *
             * @returns {Array}
             */
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
            /**
             * @returns {boolean}
             */
            isAllowAudit: function () {
                return interpreterModule.parseBooleanExpression(this.getDataFormProperties().getAllowAuditButton(), false);
            },
            /**
             * @returns {boolean}
             */
            isSearchColumnVisible: function () {
                return this.getColumnsCollection().length > 10 && !this.isCanvasView() && !this.isMapView();
            },
            getCreateEmptyProc: function () {
                return this.getDataFormProperties().getCreateEmptyProc();
            },
            /**
             *
             * @returns {Deferred}
             */
            runAsyncTaskCreateEmptyDefaultValues: function () {
                var asyncTask = deferredModule.create();
                bindModule.runAsyncTaskBindSql(this.getCreateEmptyProc())
                    .done(
                    /** @param {SqlBindingResponse} res */
                    function (res) {
                        mediator.publish(optionsModule.getChannel('socketRequest'), {
                            query: res.sql,
                            type: optionsModule.getRequestType('deferred'),
                            id: deferredModule.save(asyncTask)
                        });
                    });
                return asyncTask;
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
            /**
             * @param {Object} data
             * @returns {Deferred}
             */
            runAsyncTaskBindInsProc: function (data) {
                var extendedData = $.extend({}, this.getParamsForBind(), data),
                    sql = this.getCreateProc();
                return bindModule.runAsyncTaskBindSql(sql, extendedData, true);
            },
            deferUpdateProc: function (data) {
                var extendedData = $.extend({}, this.getParamsForBind(), data),
                    sql = this.getUpdateProc();
                return bindModule.runAsyncTaskBindSql(sql, extendedData, true);
            },
            deferDeleteProc: function (data) {
                var extendedData = $.extend({}, this.getParamsForBind(), data),
                    sql = this.getDeleteProc();
                return bindModule.runAsyncTaskBindSql(sql, extendedData, true);
            },
            /**
             *
             * @param {Object} data
             * @param {Object} [deletedData]
             * @returns {Deferred}
             */
            runAsyncTaskSave: function (data, deletedData) {
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
                                defer = this.runAsyncTaskBindInsProc(extendedData);
                            } else {
                                defer = this.deferUpdateProc(extendedData);
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
            /**
             *
             * @param {string} sql
             * @returns {Deferred}
             */
            runAsyncTaskGetData: function (sql) {
                var asyncTask = deferredModule.create();
                mediator.publish(optionsModule.getChannel('socketRequest'), {
                    query: sql,
                    type: optionsModule.getRequestType('chFormRefresh'),
                    id: deferredModule.save(asyncTask)
                });
                return asyncTask;
            },
            /**
             *
             * @returns {boolean}
             */
            isSupportCreateEmpty: function () {
                return this.getCreateEmptyProc() ? true : false;
            },
            /**
             * @returns {boolean}
             */
            isAutoOpenCard: function () {
                return interpreterModule.parseBooleanExpression(this.getCardCollection().getAutoOpen(), false);
            },
            /**
             * @returns {boolean}
             */
            isAllowCreate: function () {
                return this.isAllowWrite() && interpreterModule.parseBooleanExpression(this.getDataFormProperties().getAllowAddNew(), false);
            },
            /**
             * @returns {boolean}
             */
            isAllowSave: function () {
                return this.isAllowWrite() && interpreterModule.parseBooleanExpression(this.getDataFormProperties().getSaveButtonVisible(), false);
            },
            /**
             * @returns {boolean}
             */
            isAllowRefresh: function () {
                return interpreterModule.parseBooleanExpression(this.getDataFormProperties().getRefreshButtonVisible(), false);
            },
            /**
             *
             * @returns {boolean}
             */
            isAllowPrintActions: function () {
                return this.getPrintActions().length > 0;
            },
            getKey: function () {
                return this.getDataFormProperties().getKey();
            },
            /**
             * @returns {string}
             */
            getView: function () {
                return this.getKey() + '.xml';
            },
            isCanvasView: function () {
                return this.getKey() === 'sales\\flatsgramm';
            },
            /**
             *
             * @returns {boolean}
             */
            isMapView: function () {
                return this.getKey() === 'crm\\map';
            },
            /**
             *
             * @returns {boolean}
             */
            isAttachmentView: function () {
                return this.getKey() === 'attachmentstasks';
            },
            /**
             *
             * @returns {boolean}
             */
            isDiscussionView: function () {
                return this.getKey() === 'directory\\discussions';
            },
            /**
             * @returns {boolean}
             */
            parentModelIsNotSaved: function () {
                return helpersModule.isNewRow(this.get('parentId'));
            },
            /**
             * @returns {String}
             * @private
             */
            _getFormViewClassName: function () {
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
            /**
             * @desc Create instance of AbstractView
             * @param {jQuery} $el
             * @param {FormView} view
             * @returns {AbstractView}
             */
            makeView: function ($el, view) {
                var ViewClass = this._getFormViewClassName();
                return new ViewClass({
                    $el: $el,
                    model: this,
                    view: view
                });
            },
            /**
             *
             * @returns {jQuery|null}
             */
            getXml: function () {
                return this.get('$xml')
            },
            getColumnsCollection: function () {
                if (this._columnsCollection) {
                    return this._columnsCollection;
                }
                var columns = [],
                    $xml = this.getXml();
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
            /**
             * @returns {ActionsPropertiesCollection}
             */
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
            /**
             *
             * @returns {boolean}
             */
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
            /**
             * @returns {CardROCollection}
             */
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
            /**
             *
             * @param {CardRO} card
             * @param {CardView} view
             * @returns {Array}
             */
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
                return cardElements;
            },
            /**
             * @returns {String}
             */
            getCardTabCaption: function () {
                return this.getCardCollection().getCaption();
            },
            /**
             *
             * @returns {String}
             */
            getCaption: function () {
                return this.getDataFormProperties().getWindowCaption();
            },
            /**
             *
             * @returns {boolean}
             */
            hasHeader: function () {
                var dataFormProperties = this.getDataFormProperties();
                return dataFormProperties.getHeaderText() ||
                dataFormProperties.getHeaderImage() ||
                dataFormProperties.getStateProc();
            },
            /**
             * @returns {String}
             */
            getImage: function () {
                return this.getDataFormProperties().getHeaderImage();
            },
            getHeaderText: function () {
                return this.getDataFormProperties().getHeaderText();
            },
            getStateProc: function () {
                return this.getDataFormProperties().getStateProc();
            },
            /**
             * @returns {boolean}
             */
            hasFilters: function () {
                return this.getFiltersCollections().length !== 0 && !this.isDiscussionView();
            },
            /**
             *
             * @param {FormView} [view]
             * @param {jQuery} [$filterSection]
             * @returns {FiltersROCollection}
             */
            getFiltersROCollection: function (view, $filterSection) {
                if (this._filterRoCollection !== null) {
                    return this._filterRoCollection;
                }
                var filtersCollection = this.getFiltersCollections(),
                    filtersROCollection = new FiltersROCollection();
                filtersCollection.each(function (item) {
                    filtersROCollection.push(FilterRoFactory.make(item, view, $filterSection));
                });
                this._filterRoCollection = filtersROCollection;
                return this._filterRoCollection;
            },
            /**
             * @returns {ColumnsROCollection}
             */
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
                return interpreterModule.parseBooleanExpression(this.getDataFormProperties().getAttachmentsSupport(), false);
            },
            /**
             *
             * @returns {String}
             */
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
            /**
             * @param {Object} [filterData]
             * @param {string} [mainSql]
             * @returns {Deferred}
             */
            runAsyncTaskBindingReadProc: function (filterData, mainSql) {
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
                return bindModule.runAsyncTaskBindSql(sql, data);
            },
            /**
             *
             * @returns {Object}
             */
            getPreview: function () {
                if (this._preview === null) {
                    var preview = {};
                    this.getColumnsCollection().each(function (column) {
                        if (interpreterModule.parseBooleanExpression(column.getShowInRowDisplay())) {
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
            /**
             *
             * @returns {String}
             */
            getKeyColorColumnName: function () {
                return this.getColumnsCollection().getRowColorColumnName();
            },
            /**
             *
             * @returns {String}
             */
            getColorColumnName: function () {
                return this.getColumnsCollection().getRowColorColumnNameAlternate();
            },
            /**
             * @returns {Object}
             */
            getStorage: function () {
                var cid = this.cid;
                if (!storageModule.hasSession(cid)) {
                    storageModule.addToSession(cid, {
                        data: {},
                        order: [],
                        changed: {},
                        deleted: {}
                    });
                }
                return storageModule.getSession(cid);

            },
            /**
             * @returns {Object}
             */
            getChangedDataFromStorage: function () {
                return this.getStorage().changed;
            },
            /**
             * @returns {Object}
             */
            getDeletedDataFromStorage: function () {
                return this.getStorage().deleted;
            },
            /**
             * @param {string} [id]
             * @returns {Object}
             */
            getDBDataFromStorage: function (id) {
                if (id === undefined) {
                    return this.getStorage().data;
                } else {
                    return this.getStorage().data[id];
                }
            },
            /**
             * @param {string} [id]
             * @returns {Object}
             */
            getActualDataFromStorage: function (id) {
                if (id === undefined) {
                    return helpersModule.merge(
                        this.getDBDataFromStorage(),
                        this.getChangedDataFromStorage()
                    );
                } else {
                    return helpersModule.merge(
                        this.getDBDataFromStorage()[id],
                        this.getChangedDataFromStorage()[id]
                    );
                }
            },
            /**
             * @param id {String|int}
             */
            addDeletedToStorage: function (id) {
                this.getDeletedDataFromStorage()[id] = true;
            },
            /**
             *
             * @param id {string}
             * @param data {object}
             */
            addChangeToStorage: function (id, data) {
                if (this.getChangedDataFromStorage()[id] !== undefined) {
                    data = $.extend({}, this.getChangedDataFromStorage()[id], data);
                }
                this.getChangedDataFromStorage()[id] = data;
            },
            /**
             * @param val {Boolean}
             */
            persistSystemColumnsMode: function (val) {
                storageModule.persistSetting(this.getView(), 'systemVisibleMode', val);
            },
            /**
             * @returns {boolean}
             */
            isSystemColumnsMode: function () {
                var key = this.getView();
                if (storageModule.hasSetting(key, 'globalStyle')) {
                    return storageModule.getSettingByKey(key, 'systemVisibleMode');
                } else {
                    return false;
                }
            },
            /**
             * @param data {Object}
             * @param order {Array}
             */
            persistData: function (data, order) {
                storageModule.addToSession(this.cid, {
                    data: data,
                    order: order,
                    changed: {},
                    deleted: {}
                });
            },
            /**
             * @returns {Array}
             */
            getFormSettingsFromStorage: function () {
                var settings = storageModule.getSettings(),
                    key = this.getView();
                if (!settings.hasOwnProperty(key)) {
                    settings[key] = [];
                }
                if ($.isEmptyObject(settings[key])) {
                    settings[key] = [];
                }
                return settings[key];
            },
            /**
             * @param settings {Object}
             */
            persistColumnsSettings: function (settings) {
                storageModule.persistColumnsSettings(this.getView(), settings);
            },
            /**
             * @param val {Number}
             */
            setFormStyleID: function (val) {
                storageModule.persistSetting(this.getView(), 'globalStyle', val);
            },
            /**
             * @returns {Number}
             */
            getFormStyleID: function () {
                var key = this.getView();
                if (storageModule.hasSetting(key, 'globalStyle')) {
                    return storageModule.getSettingByKey(key, 'globalStyle');
                } else {
                    if (key === optionsModule.getConstants('tasksForTopsXml')) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            },
            /**
             * @param val {boolean}
             */
            setShortMode: function (val) {
                storageModule.persistSetting(this.getView(), 'shortVisibleMode', val);
            },
            /**
             * @returns {boolean}
             */
            isShortMode: function () {
                return storageModule.getSettingByKey(this.getView(), 'shortVisibleMode') ? true : false;
            },
            /**
             * @returns {boolean}
             */
            isAutoUpdate: function () {
                var key = this.getView();
                if (storageModule.hasSetting(key, 'auto_update')) {
                    return storageModule.getSettingByKey(key, 'auto_update') ? true : false;
                } else {
                    return false;
                }
            },
            /**
             * @description Add opened CardView to cache
             * @param view {CardView}
             */
            addOpenedCard: function (view) {
                this._openedCards[view.id] = view;
            },
            /**
             * @description Delete opened CardView from cache
             * @param id {String}
             */
            deleteOpenedCard: function (id) {
                delete this._openedCards[id];
            },
            /**
             * @description Get opened CardView from cache
             * @param id {string}
             * @returns {CardView|undefined}
             */
            getOpenedCard: function (id) {
                return this._openedCards[id];
            },
            /**
             * @desc Get All opened card for form
             * @returns {?CardView[]}
             */
            getAllOpenedCard: function () {
                return this._openedCards;
            },
            /**
             * @param data {Object}
             * @returns {Array} Columns keys
             */
            validate: function (data) {
                var requiredFields = this.getRequiredFields(),
                    errors = [];
                requiredFields.forEach(function (key) {
                    if (data[key] === undefined || !data[key]) {
                        errors.push(key);
                    }
                });
                return errors;
            },
            /**
             * @returns {boolean}
             */
            hasSettings: function () {
                return !$.isEmptyObject(this.getFormSettingsFromStorage());
            }
        });
})(storageModule, jQuery, Backbone, mediator, AttachmentColumnRO, ColumnsROCollection, ColumnsRoFactory, Card, CardElementFactory, CardROCollection, CardRO, ActionProperties, AgileFilter, PrintActions, ActionsPropertiesCollection, CardCollections, AgileFiltersCollections, ColumnProperties, ColumnsPropertiesCollection, DataFormProperties, FiltersROCollection, FilterRoFactory, deferredModule, optionsModule, bindModule, helpersModule, MapView, CanvasView, AttachmentView, DiscussionView, GridView);
