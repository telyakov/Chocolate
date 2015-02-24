var tabsModule = (function ($, helpersModule, optionsModule) {
    'use strict';
    var history = {
        tabs: [],
        size: 15,
        push: function ($tab) {
            var last = history.last();
            if (last && (last[0] === $tab[0])) {
                return;
            }
            if (history.tabs.length > history.size) {
                history.tabs.shift();
            }
            history.tabs.push($tab);
        },
        /**
         * @returns {int|null}
         */
        pop: function () {
            var $popTab = history.tabs.pop();
            history.tabs.forEach(function ($elem, index) {
                if ($popTab[0] === $elem[0]) {
                    history.tabs.splice(index, 1);
                }
            });
            return history.lastIndex();
        },
        last: function () {
            if (history.tabs.length) {
                return history.tabs[history.tabs.length - 1];
            } else {
                return null;
            }
        },
        /**
         * @returns {int|null}
         */
        lastIndex: function () {
            var last = history.last();
            if (last) {
                return last.index();
            } else {
                return null;
            }
        }
    };
    var _private = {
        close: function ($a) {
            var $item = $a.parent(),
                index = $item.index(),
                $tabs = helpersModule.getTabsObj();

            if ($item.hasClass(optionsModule.getClass('activeTab'))) {
                var nextIndex = history.pop();
                $tabs.tabs({active: nextIndex});
                mediator.publish(optionsModule.getChannel('reflowTab'));
            }

            $item.children('.ui-tabs-anchor').remove();
            var $panel = $('#' + $item.attr("aria-controls"));
            $panel.off();
            $tabs.tabs('remove', index);
            $tabs.tabs('refresh');
        }
    };
    return {
        /**
         *
         * @param {jQuery} $tab
         */
        push: function ($tab) {
            history.push($tab);
        },
        /**
         *
         * @returns {int|null}
         */
        pop: function () {
            return history.pop();
        },
        /**
         *
         * @param $tab {jQuery}
         * @return {Number}
         */
        getIndex: function ($tab) {
            return $tab.closest('ul').find('li').index($tab.parent());
        },
        /**
         * @returns {?jQuery}
         */
        getActiveTab: function () {
            return helpersModule.getTabsObj()
                .children('.' + optionsModule.getClass('tabMenuClass'))
                .children('.' + optionsModule.getClass('activeTab'))
                .children('a');
        },
        /**
         * @param $a {jQuery}
         */
        close: function ($a) {
            _private.close($a);
        },
        /**
         *
         * @param {String} targetID
         * @param {String} name
         * @returns {string}
         */
        createTabLink: function (targetID, name) {
            return [
                '<a id="',
                helpersModule.uniqueID(),
                '" href="#',
                targetID,
                '">',
                name,
                '</a><span class="tab-closed fa fa-times"></span>'
            ].join('');
        }
    };
})(jQuery, helpersModule, optionsModule);