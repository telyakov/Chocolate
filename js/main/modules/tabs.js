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
            Chocolate.tab.close($a);
        },
        /**
         * @returns {ChTab}
         */
        getActiveChTab: function () {
          return _private.getActiveChTab();
        }
    };
})(jQuery);