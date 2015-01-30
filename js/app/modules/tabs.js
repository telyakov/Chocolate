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
                //var card = factoryModule.makeChCard(activeTab.getPanel().children('[data-id=grid-tabs]'));
                //todo: вернуть код
                //card._undoChange();
            } else {
                //todo: вернуть код
                //var form = factoryModule.makeChGridForm(activeTab.getPanel().find('.section-grid>form'));
                //if (form.isHasChange !== undefined && form.$form.length && form.isHasChange() && !confirm(form.getExitMessage())) {
                //    return;
                //}

                //.getExitMessage = function () {
                //    return 'В форме "' + this.getTabCaption() + '" имеются несохраненные изменения. Закрыть без сохранения?';
                //};
            }
            var $tab = activeTab.getLi();
            var index = $tab.index();
            if ($tab.hasClass(optionsModule.getClass('activeTab'))) {
                var nextIndex = history.pop();
                helpersModule.getTabsObj().tabs({ active: nextIndex });
                mediator.publish(optionsModule.getChannel('reflowTab'));
            }
            var $panel = $('#' + $tab.attr("aria-controls"));
            $panel.off();
            helpersModule.getTabsObj().tabs('remove', index);
            helpersModule.getTabsObj().tabs('refresh');
            factoryModule.garbageCollection();
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
            //todo: close card by escape
            _private.close(_private.getActiveChTab().$a);
        },
        /**
         *
         * @param $tabLink {jQuery}
         * @return {Number}
         */
        getIndex: function($tabLink){
           return  $tabLink.closest('ul').find('li').index($tabLink.parent());
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
        createTabLink: function(targetID, name){
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
})(jQuery, helpersModule, optionsModule, factoryModule, undefined);