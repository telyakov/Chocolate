var tabsModule = (function ($, helpersModule, optionsModule, factoryModule, undefined) {
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
        getActiveChTab: function () {
            var $link = helpersModule.getTabsObj()
                .children('.' + optionsModule.getClass('tabMenuClass'))
                .children('.' + optionsModule.getClass('activeTab'))
                .children('a');
            return factoryModule.makeChTab($link);
        },
        close: function ($a) {
            var activeTab = factoryModule.makeChTab($a);
            if (activeTab.isCardTypePanel()) {
                var card = factoryModule.makeChCard(activeTab.getPanel().children('[data-id=grid-tabs]'));
                card._undoChange();
            } else {
                var form = factoryModule.makeChGridForm(activeTab.getPanel().find('.section-grid>form'));
                if (form.isHasChange !== undefined && form.$form.length && form.isHasChange() && !confirm(form.getExitMessage())) {
                    return;
                }
            }
            var $tab = activeTab.getLi();
            if ($tab.hasClass(optionsModule.getClass('activeTab'))) {
                var nextIndex = history.pop();
                helpersModule.getTabsObj().tabs({ active: nextIndex });
                mediator.publish(optionsModule.getChannel('reflowTab'));
            }
            var $panel = $('#' + $tab.remove().attr("aria-controls"));
            _private.destroy($panel);
            helpersModule.getTabsObj().tabs('refresh');
            factoryModule.garbageCollection();
        },
        destroy: function ($panel) {
            $panel.find('.editable').editable('destroy').remove();
            $panel.remove();
        },
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
        },
        add: function (id, name) {
            var $item = $('<li>', {
                    html: _private.createTabLink(id, name)
                }),
                $tabs = helpersModule.getTabsObj();
            $tabs.children('ul').append($item);
            $tabs.tabs();
            $tabs.tabs('refresh');
            history.push($item);
            return $item;
        },
        addAndSetActive: function (id, name) {
            var $item = _private.add(id, name);
            helpersModule.getTabsObj().tabs({ active: $item.index() });
            return $item;
        }
    };
    return {
        push: function ($tab) {
            history.push($tab);
        },
        pop: function () {
            return history.pop();
        },
        closeActiveTab: function () {
            _private.close(_private.getActiveChTab().$a);
        },
        /**
         * @returns {ChTab}
         */
        getActiveChTab: function () {
            return _private.getActiveChTab();
        },
        /**
         * @param $a {jQuery}
         */
        close: function ($a) {
            _private.close($a);
        },
        /**
         * @param id {string}
         * @param name {string}
         * @returns {jQuery}
         */
        add: function (id, name) {
            return _private.add(id, name);
        },
        /**
         * @param targetID {string}
         * @param name {string}
         * @returns {string}
         */
        createTabLink: function (targetID, name) {
            return _private.createTabLink(targetID, name);
        },
        /**
         * @param id {string}
         * @param name {string}
         * @returns {jQuery}
         */
        addAndSetActive: function (id, name) {
            return _private.addAndSetActive(id, name);
        }
    };
})(jQuery, helpersModule, optionsModule, factoryModule, undefined);