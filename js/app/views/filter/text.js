/**
 * Class TextFilterView
 * @class
 * @augments FilterView
 */
var TextFilterView = (function (Backbone, $, helpersModule, FilterView) {
    'use strict';
    return FilterView.extend(
        /** @lends TextFilterView */
        {
            template: _.template([
                '<% if (isNextRow) { %> </div><div class="filter-row"><% } %>',
                '<li class="filter-item" id="<%= containerID %>">',
                '<% if (disabled) { %> <div class="filter-mock-no-edit"></div>  <% } %>',
                '<div class="text-filter" title="<%= tooltip %>">',
                '<label for="<%= id %>"><%= caption %></label>',
                '<input <% if (disabled) { %> disabled  <% } %> attribute="filters[<%= attribute %>]" name="<%= attribute %>"',
                ' placeholder="<%= tooltip %>" class="filter" id="<%= id %>" type="search" value="<%= value %>">',
                '</div>',
                '</li>'
            ].join('')),
            /**
             * @override
             */
            destroy: function () {
                delete this.template;
                FilterView.prototype.destroy.apply(this);
            },
            /**
             * @param {string} event
             * @param {Number} i
             * @override
             */
            render: function (event, i) {
                var _this = this,
                    model = this.getModel();

                $.when(
                    model.runAsyncTaskIsVisible(),
                    model.runAsyncTaskIsEnabled(),
                    model.runAsyncTaskIsNextRow()
                ).done(
                    /**
                     * @param {BooleanResponse} isVisibleResponse
                     * @param {BooleanResponse} isEnabledResponse
                     * @param {BooleanResponse} isNextRowResponse
                     * @private
                     */
                        function (isVisibleResponse, isEnabledResponse, isNextRowResponse) {
                        var isDisabled = !isEnabledResponse.value,
                            isVisible = isVisibleResponse.value,
                            isNextRow = isNextRowResponse.value,
                            text = _this._getFilterHtml(isVisible, isDisabled, isNextRow);
                        $.publish(event, {
                            text: text,
                            counter: i
                        });
                    })
                    .fail(function (error) {
                        _this.handleError(error, event, i);
                    });

            },
            /**
             *
             * @param {Boolean} isVisible
             * @param {Boolean} isDisabled
             * @param {Boolean} isNextRow
             * @returns {string}
             * @private
             */
            _getFilterHtml: function (isVisible, isDisabled, isNextRow) {
                if (isVisible) {
                    var model = this.getModel();
                    return this.template({
                        id: helpersModule.uniqueID(),
                        caption: model.getCaption(),
                        attribute: model.getAttribute(),
                        tooltip: model.getTooltip(),
                        disabled: isDisabled,
                        isNextRow: isNextRow,
                        value: model.getValue(),
                        containerID: this.id
                    });
                }
                return '';
            }
        });
})(Backbone, jQuery, helpersModule, FilterView);