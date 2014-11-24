var FormModel = (function ($, Backbone, ActionsPropertiesCollection, CardCollections, AgileFiltersCollections) {
    'use strict';
    return Backbone.Model.extend({
        _columnProperties: null,
        _dataFormProperties: null,
        _agileFilters: null,
        _gridProperties: null,
        _actionProperties: null,
        _dataFormModel: null,
        _card_collection: null,
        defaults: {
            $xml: null,
            parentModel: null,
            parentId: null
        },
        getColumnProperties: function () {
            if (this._columnProperties) {
                return this._columnProperties;
            }

            return this._columnProperties;
        },
        getDataFormProperties: function () {
            if (this._dataFormProperties) {
                return this._dataFormProperties;
            }
        },
        getAgileFilters: function () {
            if (this._agileFilters) {
                return this._agileFilters;
            }
            var filters = [],
                $xml =  this.get('$xml');
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
        getGridProperties: function () {
            if (this._gridProperties) {
                return this._gridProperties;
            }
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
        getDataFormModel: function () {
            if (this._dataFormModel) {
                return this._dataFormModel;
            }
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
        }

    });
})(jQuery, Backbone, ActionsPropertiesCollection, CardCollections, AgileFiltersCollections);
