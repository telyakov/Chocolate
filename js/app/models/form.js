var FormModel = (function ($, Backbone, ActionsPropertiesCollection, CardCollections, AgileFiltersCollections, ColumnProperties, ColumnsPropertiesCollection, DataFormProperties, FiltersROCollection, FilterRoFactory) {
    'use strict';
    return Backbone.Model.extend({
        _columnsCollection: null,
        _dataFormProperties: null,
        _agileFilters: null,
        _actionProperties: null,
        _card_collection: null,
        _filter_ro_collection: null,
        _print_actions: null,
        _columns_ro_collection: null,
        defaults: {
            $xml: null,
            parentModel: null,
            parentId: null
        },
        getColumnsDefaultValues: function () {
            var defaults = {},
                def;

            this.getColumnsROCollection().each(function (column) {
                def = column.getDefault();
                if (def !== '' && def !== null) {
                    defaults[column.get('key')] = def;
                }
            });
            return defaults;
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
            if (this._print_actions !== null) {
                return this._print_actions;
            }

            var printActions = new PrintActions({
                printActionsXml: this.getDataFormProperties().getPrintActionsXml()
            });
            this._print_actions = printActions.getActions();
            return this._print_actions;
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
            var defaultDefer = deferredModule.create(),
                defaultDeferID = deferredModule.save(defaultDefer),
                defer = bindModule.deferredBindSql(this.getCreateEmptyProc());
            defer.done(function (res) {
                var sql = res.sql;
                mediator.publish(optionsModule.getChannel('socketRequest'), {
                    query: sql,
                    type: optionsModule.getRequestType('deferred'),
                    id: defaultDeferID
                });
            });
            return defaultDefer;

        },
        getCreateProc: function () {
            return this.getDataFormProperties().getCreateProc();
        },
        getUpdateProc: function () {
            var sql = this.getDataFormProperties().getValidationProc();
            if (!sql) {
                sql = this.getDataFormProperties().getUpdateProc();
            }
            return sql;
        },
        deferSave: function (data) {
            var defer = deferredModule.create(),
                deferID = deferredModule.save(defer),
                sql;
            if ($.isNumeric(data.id)) {
                sql = this.getUpdateProc();
            } else {
                sql = this.getCreateProc();
            }
            var extendedData = $.extend({}, this.getParamsForBind(), data),
                paramDefer = bindModule.deferredBindSql(sql, extendedData, true);
            paramDefer.done(function (res) {
                mediator.publish(optionsModule.getChannel('socketRequest'), {
                    query: res.sql,
                    type: optionsModule.getRequestType('deferred'),
                    id: deferID
                });
            });
            return defer;
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
            return parentID && !$.isNumeric(parentID);
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
                    $columns;
                $columns = $($.parseXML($.trim($gridLayout.text())));
                var $gridProperties = $columns.find('GridProperties');
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
                    $filters;
                $filters = $($.parseXML($.trim($filtersPanel.text())));
                var $agileFilters = $filters.find('AgileFilters');
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
                $actions = $.parseXML($.trim($actions.text()));
                $($actions).find('MenuAction').each(function () {
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
            if (this._card_collection) {
                return this._card_collection;
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
                this._card_collection = new CardCollections(cards, {
                    $obj: $cards.children('Cards').children('Style')
                });
            }
            return this._card_collection;
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
        getCardElements: function (card) {
            var key = card.getKey(),
                cardElements = [],
                collection = this.getColumnsCardROCollection(),
                _this = this;
            collection.each(function (model) {
                if (model.getCardKey() === key) {
                    var elem = CardElementFactory.make(model, collection, _this);
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
        getFiltersROCollection: function () {
            if (this._filter_ro_collection !== null) {
                return this._filter_ro_collection;
            }
            var _this = this;
            var filtersCollection = this.getFiltersCollections(),
                filtersROCollection = new FiltersROCollection();
            filtersCollection.each(function (item) {
                filtersROCollection.push(FilterRoFactory.make(item, _this));
            });
            this._filter_ro_collection = filtersROCollection;
            return this._filter_ro_collection;
        },
        getColumnsROCollection: function () {
            if (this._columns_ro_collection !== null) {
                return this._columns_ro_collection;
            }
            var columnsCollection = this.getColumnsCollection(),
                columnsROCollection = new ColumnsROCollection();
            columnsCollection.each(function (item) {
                var columnRO = ColumnsRoFactory.make(item);
                if (columnRO.isVisible()) {
                    columnsROCollection.push(columnRO);
                }
            });
            this._columns_ro_collection = columnsROCollection;
            if (this.isAttachmentSupport()) {
                columnsROCollection.push(new AttachmentColumnRO());
            }
            return this._columns_ro_collection;
        },
        _columns_card_ro_collection: null,
        getColumnsCardROCollection: function () {
            if (this._columns_card_ro_collection !== null) {
                return this._columns_card_ro_collection;
            }
            var columnsCollection = this.getColumnsCollection(),
                columnsROCollection = new ColumnsROCollection();
            columnsCollection.each(function (item) {
                var columnRO = ColumnsRoFactory.make(item);
                if (columnRO.isVisibleInCard()) {
                    columnsROCollection.push(columnRO);
                }
            });
            this._columns_card_ro_collection = columnsROCollection;
            return this._columns_card_ro_collection;
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
        _preview: null,
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
})(jQuery, Backbone, ActionsPropertiesCollection, CardCollections, AgileFiltersCollections, ColumnProperties, ColumnsPropertiesCollection, DataFormProperties, FiltersROCollection, FilterRoFactory);
