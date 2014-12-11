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
        hasCard: function () {
            return this.getCardCollection()._length > 0;
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
        isSupportCreateEmpty: function () {
            return this.getDataFormProperties().getCreateEmptyProc() ? true : false;
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
        getKeyInLowerCase: function(){
            return this.getKey().toLowerCase();
        },
        getView: function () {
            return this.getKey() + '.xml';
        },
        isCanvasView: function(){
            return this.getKeyInLowerCase() === 'sales\\flatsgramm';
        },
        isMapView: function() {
            return this.getKeyInLowerCase() ==='crm\\map';
        },
        isAttachmentView: function(){
            return this.getKeyInLowerCase() ==='attachments';
        },
        isDiscussionView: function(){
            return this.getKeyInLowerCase() ==='directory\\discussions';

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
                    $obj: $cards
                });
            }
            return this._card_collection;
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
            var filtersCollection = this.getFiltersCollections(),
                filtersROCollection = new FiltersROCollection();
            filtersCollection.each(function (item) {
                filtersROCollection.push(FilterRoFactory.make(item));
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
        isAttachmentSupport: function () {
            return helpersModule.boolEval(this.getDataFormProperties().getAttachmentsSupport(), false);
        },
        getEntityTypeID: function(){
            return this.getDataFormProperties().getAttachmentsEntityType();
        },
        getParentEntityTypeID: function(){
            var parentModel = this.get('parentModel');
            if(parentModel){
                return parentModel.getEntityTypeID();
            }else{
                return null;
            }
        },
        readProcEval: function (deferID) {
            var data ={
                entityid: this.get('parentId'),
                parentid: this.get('parentId'),
                entitytype: this.getParentEntityTypeID(),
                entitytypeid: this.getParentEntityTypeID()
            };
            bindModule.deferredBindSql(deferID, this.getDataFormProperties().getReadProc(), data);
        },
        getKeyColorColumnName: function () {
            return this.getColumnsCollection().getRowColorColumnName();
        },
        getColorColumnName: function () {
            return this.getColumnsCollection().getRowColorColumnNameAlternate();
        }

    });
})(jQuery, Backbone, ActionsPropertiesCollection, CardCollections, AgileFiltersCollections, ColumnProperties, ColumnsPropertiesCollection, DataFormProperties, FiltersROCollection, FilterRoFactory);
