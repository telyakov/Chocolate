var tabsModule = (function($){
    var history ={
        tabs: [],
        size: 15,
        push: function($tab){
            var last =this.last();
            if(last &&(last[0] === $tab[0])){
                return;
            }
            if(this.tabs.length  > this.size){
                this.tabs.shift();
            }
            this.tabs.push($tab);
        },
        /**
         * @returns {int|null}
         */
        pop: function(){
            var $popTab = this.tabs.pop(),
                _this = this;
            this.tabs.forEach(function($elem,index){
                if ($popTab[0] === $elem[0]){
                    _this.tabs.splice(index, 1);
                }
            });
            return this.lastIndex();
        },
        last: function(){
            if(this.tabs.length){
                return this.tabs[this.tabs.length -1];
            }else{
                return null;
            }
        },
        /**
         * @returns {int|null}
         */
        lastIndex: function(){
            var last = this.last();
            if(last){
                return last.index();
            }else{
                return null;
            }
        }
    };
    var _private = {
        getActiveChTab: function(){
            var $activeLink = Chocolate.$tabs
                .children(Chocolate.clsSel(ChOptions.classes.tabMenuClass))
                .children(Chocolate.clsSel(ChOptions.classes.activeTab))
                .children('a');
            return facade.getFactoryModule().makeChTab($activeLink);
        },
        close: function ($a) {
            var activeTab = facade.getFactoryModule().makeChTab($a);
            if (activeTab.isCardTypePanel()) {
                var card = facade.getFactoryModule().makeChCard(activeTab.getPanel().children('[data-id = grid-tabs]'));
                card._undoChange();
            } else {
                var form = facade.getFactoryModule().makeChGridForm(activeTab.getPanel().find('.section-grid>form'));
                if (typeof form.isHasChange !== 'undefined' && form.$form.length && form.isHasChange() && !confirm(form.getExitMessage())) {
                    return;
                }
            }
            var $tab = activeTab.getLi();
            if ($tab.hasClass(ChOptions.classes.activeTab)) {
                var nextIndex = facade.getTabsModule().pop();
                Chocolate.$tabs.tabs({ active: nextIndex });
                chApp.getDraw().reflowActiveTab();
            }
            var tabSelector = Chocolate.idSel($tab.remove().attr("aria-controls"));
            var $panel = $(tabSelector);
            try {
                $panel.find('.ui-resizable').each(function () {
                    $(this).resizable('destroy');
                });
            } catch (e) {
            }

            try {
                $panel.find('.editable').each(function () {
                    $(this).editable('destroy').remove();
                });
            } catch (e) {
                console.log(e);
            }
            try {
//                $panel.find('.toggle-button').each(function(){$(this).remove()});
                $panel.find('.menu-button, .tree-button, .tablesorter-filter, .tablesorter-header a, .tablesorter-header div, .form-vertical input').each(function () {
                    $(this).remove();
                });
                $panel.find(' .tablesorter-header,.form-vertical ').each(function () {
                    $(this).remove();
                });
                $panel.find('.tablesorter').trigger('destroy');
                $panel.find('.grid-view>table').floatThead('destroy');
                $panel.find(' .table-bordered').each(function () {
                    $(this).remove();
                });
                $panel.find(' .grid-view').each(function () {
                    $(this).remove();
                });
            } catch (e) {
                console.log(e);
            }

            $panel.remove();
            Chocolate.$tabs.tabs("refresh");
            facade.getFactoryModule().garbageCollection();
        },
        createTabLink: function (targetID, name) {
            return [
                '<a id="',
                Chocolate.uniqueID(),
                '" href="#',
                targetID,
                '">',
                name,
                '</a><span class="tab-closed fa fa-times"></span>'
            ].join('');
        }
    };
    return {
        push: function($tab){
            history.push($tab);
        },
        pop: function(){
            return history.pop();
        },
        closeActiveTab: function () {
            var $a = _private.getActiveChTab().$a;
            _private.close($a);
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
        close: function($a){
            _private.close($a);
        },
        /**
         * @param id {string}
         * @param name {string}
         * @returns {jQuery}
         */
        add: function (id, name) {
            var $tabItem = $('<li>' + _private.createTabLink(id, name) + '</li>');
            Chocolate.$tabs.children('ul').append($tabItem);
            Chocolate.$tabs.tabs();
            Chocolate.$tabs.tabs('refresh');
            facade.getTabsModule().push($tabItem);
            return $tabItem;
        },
        /**
         * @param targetID {string}
         * @param name {string}
         * @returns {string}
         */
        createTabLink: function (targetID, name) {
            return _private.createTabLink(targetID, name);
        }
    };
})(jQuery);