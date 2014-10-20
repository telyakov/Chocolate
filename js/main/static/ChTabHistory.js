var ChTabHistory ={
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