var FormModel = (function ($, Backbone, ActionsPropertiesCollection, CardCollections, AgileFiltersCollections, ColumnProperties, ColumnsPropertiesCollection, DataFormProperties, FiltersROCollection, FilterRoFactory) {
    'use strict';
    return Backbone.Model.extend({
        _columnsCollection: null,
        _dataFormProperties: null,
        _agileFilters: null,
        _actionProperties: null,
        _card_collection: null,
        _filter_ro_collection: null,
        defaults: {
            $xml: null,
            parentModel: null,
            parentId: null
        },
        getKey: function () {
            return this.getDataFormProperties().getKey();
        },
        getView: function () {
            return this.getKey() + '.xml';
        },
        getFormView: function () {
            var key = this.getKey().toLowerCase();
            switch (key) {
                case 'crm\\map':
                    return MapView;
                case 'sales\\flatsgramm':
                    return CanvasView;
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
            return this.getFiltersCollections().length !== 0;
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
        }

    });
})(jQuery, Backbone, ActionsPropertiesCollection, CardCollections, AgileFiltersCollections, ColumnProperties, ColumnsPropertiesCollection, DataFormProperties, FiltersROCollection, FilterRoFactory);
