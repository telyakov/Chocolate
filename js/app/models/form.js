var FormModel = (function (Backbone, ActionsPropertiesCollection) {
    'use strict';
    return Backbone.Model.extend({
        _columnProperties: null,
        _dataFormProperties: null,
        _agileFilters: null,
        _gridProperties: null,
        _actionProperties: null,
        _dataFormModel: null,
        _card: null,
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
                console.log($xml, $xml.html())

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
        getCard: function () {
            if (this._card) {
                return this._card;
            }
        }

    });
})(Backbone, ActionsPropertiesCollection);
